import OpenAI from 'openai'
import type { DocumentExtraction, DocumentType } from '@/types'

// ============================================================
// AI 문서 분석 엔진
// - OpenAI structured output으로 필드 추출
// - 없으면 절대 추측하지 않고 not_found
// - source_text와 source_page 반드시 포함
// ============================================================

// 추출 대상 필드 목록 (PRD 15항)
export const EXTRACTION_FIELDS = [
  'brand_name',
  'hq_name',
  'franchise_fee',
  'education_fee',
  'deposit',
  'interior_cost',
  'equipment_cost',
  'initial_inventory',
  'royalty',
  'advertising_fee',
  'average_sales',
  'store_count',
  'closure_count',
  'contract_term',
  'renewal_conditions',
  'termination_conditions',
  'territory',
  'required_purchase',
  'remodeling_obligation',
  'other_costs',
] as const

export type ExtractionField = (typeof EXTRACTION_FIELDS)[number]

// 필드별 한국어 설명 (AI 프롬프트용)
const FIELD_DESCRIPTIONS: Record<ExtractionField, string> = {
  brand_name: '브랜드명 (가맹점 브랜드 이름)',
  hq_name: '가맹본부(회사) 명칭',
  franchise_fee: '가맹비(가입비) — 숫자+단위(원, 만원, 억원)로 추출',
  education_fee: '교육비 — 숫자+단위',
  deposit: '가맹보증금 — 숫자+단위',
  interior_cost: '인테리어(시설) 비용 — 숫자+단위 또는 범위',
  equipment_cost: '장비·집기 비용 — 숫자+단위',
  initial_inventory: '초도물류비(초기 재고) — 숫자+단위',
  royalty: '로열티(수수료) — 금액 또는 비율(%)',
  advertising_fee: '광고분담금(마케팅 분담금) — 금액 또는 비율',
  average_sales: '가맹점 평균 매출 — 숫자+단위+기간',
  store_count: '현재 가맹점 수 (영업 중)',
  closure_count: '폐점(계약해지) 매장 수 — 기간 명시 필요',
  contract_term: '계약 기간 (년)',
  renewal_conditions: '재계약(갱신) 조건 — 조건 요약',
  termination_conditions: '중도해지 조건 및 위약금 — 조건 요약',
  territory: '영업지역 보호 조항 — 조항 요약',
  required_purchase: '필수 구매 품목 및 조건',
  remodeling_obligation: '인테리어 리뉴얼 의무 조항',
  other_costs: '기타 비용 항목 목록',
}

export interface DocumentExtractionResult {
  field_key: ExtractionField
  extracted_value: string | null
  confidence: 'confirmed' | 'uncertain' | 'not_found'
  source_page: number | null
  source_text: string | null
}

// AI에게 반환받을 JSON 스키마
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    extractions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field_key: { type: 'string', enum: EXTRACTION_FIELDS },
          extracted_value: { type: ['string', 'null'] },
          confidence: {
            type: 'string',
            enum: ['confirmed', 'uncertain', 'not_found'],
          },
          source_page: { type: ['number', 'null'] },
          source_text: { type: ['string', 'null'] },
        },
        required: ['field_key', 'extracted_value', 'confidence', 'source_page', 'source_text'],
        additionalProperties: false,
      },
    },
  },
  required: ['extractions'],
  additionalProperties: false,
}

const SYSTEM_PROMPT = `당신은 프랜차이즈 관련 문서(정보공개서, 가맹계약서, 예상매출액 산정서 등)에서 정보를 추출하는 AI입니다.

반드시 지켜야 할 규칙:
1. 문서에 명확히 기재된 정보만 추출합니다.
2. 문서에 없는 내용은 절대 추측하거나 생성하지 않습니다. 없으면 confidence: "not_found", extracted_value: null로 표시합니다.
3. 추출한 모든 항목은 반드시 근거 원문(source_text)과 페이지(source_page)를 함께 제공합니다.
4. 금액은 원문 그대로 표기합니다 (예: "5,000만원", "3.2억원").
5. 비율은 "매출액의 2%" 형식으로 표기합니다.
6. 법적 판단(불법, 사기 등)은 절대 하지 않습니다.
7. confidence 기준:
   - confirmed: 문서에 명확히 기재된 항목
   - uncertain: 유추 가능하나 명확하지 않은 항목
   - not_found: 문서에서 찾을 수 없는 항목`

function buildUserPrompt(
  text: string,
  docType: DocumentType,
  fieldDescriptions: Record<string, string>
): string {
  const fieldList = Object.entries(fieldDescriptions)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join('\n')

  return `다음은 ${getDocTypeLabel(docType)} 문서입니다. 아래 필드들을 추출해주세요.

추출 대상 필드:
${fieldList}

문서 내용:
---
${text.substring(0, 12000)}  
---

각 필드에 대해 문서에서 찾은 값, 신뢰도, 근거 원문, 페이지 번호를 반환해주세요.
없는 항목은 반드시 not_found로 표시하고 절대 추측하지 마세요.`
}

function getDocTypeLabel(docType: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    disclosure_doc: '정보공개서',
    contract: '가맹계약서',
    sales_estimate: '예상매출액 산정서',
    hq_material: '본사 제공 자료',
    quote: '견적서',
    consultation_record: '상담 기록',
    other: '기타 문서',
  }
  return labels[docType] ?? '문서'
}

/**
 * OpenAI를 사용해 문서에서 핵심 항목 추출
 * 모든 미발견 항목은 not_found로 처리 (추측 금지)
 */
export async function extractFromDocument(
  text: string,
  docType: DocumentType,
  openaiClient: OpenAI
): Promise<DocumentExtractionResult[]> {
  if (!text || text.trim().length < 50) {
    return EXTRACTION_FIELDS.map((field) => ({
      field_key: field,
      extracted_value: null,
      confidence: 'not_found' as const,
      source_page: null,
      source_text: null,
    }))
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'document_extraction',
          schema: EXTRACTION_SCHEMA,
          strict: true,
        },
      },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildUserPrompt(text, docType, FIELD_DESCRIPTIONS),
        },
      ],
      max_tokens: 4000,
      temperature: 0,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    const parsed = JSON.parse(content) as {
      extractions: DocumentExtractionResult[]
    }

    // 누락 필드 보완 (not_found로)
    const resultMap = new Map(parsed.extractions.map((e) => [e.field_key, e]))
    return EXTRACTION_FIELDS.map((field) => {
      return (
        resultMap.get(field) ?? {
          field_key: field,
          extracted_value: null,
          confidence: 'not_found' as const,
          source_page: null,
          source_text: null,
        }
      )
    })
  } catch (error) {
    console.error('[DocumentExtractor] OpenAI extraction failed:', error)
    // 실패 시 모두 not_found로 반환
    return EXTRACTION_FIELDS.map((field) => ({
      field_key: field,
      extracted_value: null,
      confidence: 'not_found' as const,
      source_page: null,
      source_text: null,
    }))
  }
}

/**
 * 상담 내용 요약 (본사 구두 설명 → 구조화)
 * AI 사용 원칙: 법적 판단·사기 단정 금지
 */
export async function summarizeConsultation(
  consultationText: string,
  openaiClient: OpenAI
): Promise<string> {
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `당신은 프랜차이즈 상담 내용을 정리하는 도우미입니다.
규칙:
- 입력된 내용만 정리하고 없는 내용을 추가하지 않습니다.
- 법적 판단(불법, 사기 등)을 하지 않습니다.
- 항목별로 간결하게 정리합니다.
- 불명확한 내용은 "(확인 필요)"로 표시합니다.`,
      },
      {
        role: 'user',
        content: `다음 상담 내용을 항목별로 정리해주세요:\n\n${consultationText}`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.1,
  })
  return response.choices[0]?.message?.content ?? consultationText
}
