// ============================================================
// Franchise Check — 핵심 TypeScript 타입 정의
// ============================================================

// ── 기본 enum 타입 ──────────────────────────────────────────

/** 답변 상태: 확인함 / 확인하지 않음 / 모름 — 절대 동일하게 취급하지 않음 */
export type AnswerState = 'confirmed' | 'not_checked' | 'unknown'

/** 정보 출처 유형 */
export type SourceType =
  | 'hq_verbal'      // 본사 구두 설명
  | 'hq_sms'         // 본사 문자
  | 'hq_email'       // 본사 이메일
  | 'hq_document'    // 본사 자료
  | 'disclosure_doc' // 정보공개서
  | 'contract'       // 계약서
  | 'actual_owner'   // 실제 점주
  | 'self_verified'  // 사용자 직접 확인
  | 'other'

/** 답변 입력 방식 */
export type AnswerType =
  | 'amount'        // 금액 입력
  | 'select'        // 단일 선택
  | 'multi_select'  // 복수 선택
  | 'text'          // 텍스트
  | 'date'          // 날짜
  | 'boolean'       // 예/아니오

/** 질문 카테고리 (12 STEP) */
export type QuestionCategory =
  | 'situation'        // STEP 1: 나의 창업 상황
  | 'brand'            // STEP 2: 관심 프랜차이즈
  | 'hq_consultation'  // STEP 3: 본사 상담 내용
  | 'investment'       // STEP 4: 투자금/비용 확인
  | 'sales'            // STEP 5: 매출/수익 확인
  | 'contract'         // STEP 6: 계약조건 확인
  | 'verification'     // STEP 7: 본사 및 가맹점 확인
  | 'document'         // STEP 8: 문서 업로드
  | 'analysis'         // STEP 9: AI 문서 분석
  | 'missing'          // STEP 10: 부족한 정보 확인
  | 'followup'         // STEP 11: 본사에게 물어볼 질문
  | 'report'           // STEP 12: 최종 종합 리포트

/** 리스크 심각도 */
export type RiskSeverity = 'critical' | 'warning' | 'info'

/** 리스크 플래그 유형 */
export type RiskFlagType =
  | 'discrepancy'        // 자료 간 수치 불일치
  | 'missing_critical'   // 핵심 정보 미확인
  | 'missing_important'  // 중요 정보 미확인
  | 'financial_risk'     // 재무 위험
  | 'contract_risk'      // 계약 위험
  | 'unknown_data'       // 모름 상태의 고위험 항목

/** 세션 진행 상태 */
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

/** 업로드 문서 유형 */
export type DocumentType =
  | 'disclosure_doc'       // 정보공개서
  | 'contract'             // 가맹계약서
  | 'sales_estimate'       // 예상매출액 산정서
  | 'hq_material'          // 본사 제공 자료
  | 'quote'                // 견적서
  | 'consultation_record'  // 문자/상담 내용
  | 'other'

/** 문서 파싱 상태 */
export type ParseStatus = 'pending' | 'processing' | 'done' | 'failed'

/** 최종 판단 (4가지 중 하나) */
export type FinalVerdict =
  | 'need_more_info'      // 현재 정보만으로 계약 진행 전 추가 확인 필요
  | 'mostly_confirmed'    // 상당 부분 확인되었으나 일부 핵심사항 확인 필요
  | 'well_confirmed'      // 주요 사항이 비교적 확인됨
  | 'expert_consultation' // 전문가 상담을 권장할 정도의 고위험 항목 존재

/** 점수 레벨 */
export type ScoreLevel = 'very_high_risk' | 'caution' | 'needs_check' | 'good'

// ── 엔티티 타입 ────────────────────────────────────────────

/** 질문 선택지 */
export interface QuestionOption {
  id: string
  question_id: string
  option_key: string
  option_text: string
  order_index: number
  triggers_followup: boolean
}

/** 조건부 질문 표시 조건 */
export interface QuestionCondition {
  id: string
  question_id: string           // 이 질문이 표시되기 위한 조건
  parent_question_id: string    // 부모 질문 ID
  trigger_option_key: string    // 부모 질문에서 이 옵션 선택 시 표시
}

/** 질문 */
export interface Question {
  id: string
  question_key: string          // 코드에서 참조용 고유 키
  category: QuestionCategory
  step_number: number           // 1~12
  order_in_step: number         // STEP 내 순서
  question_text: string
  description: string | null    // "왜 중요한가요?" 내용
  answer_type: AnswerType
  is_required: boolean
  risk_weight: number           // 미확인 시 리스크 가중치 (0~5)
  missing_weight: number        // "모름" 시 추가 가중치 (0~5)
  source_type: SourceType | null
  is_active: boolean
  created_at: string
  options?: QuestionOption[]
  conditions?: QuestionCondition[]
}

/** 사용자 답변 */
export interface QuestionAnswer {
  id: string
  session_id: string
  question_id: string
  answer_value: unknown         // jsonb - 타입별로 유연하게 저장
  answer_state: AnswerState     // 핵심: confirmed / not_checked / unknown
  source_type: SourceType | null
  created_at: string
  updated_at: string
}

/** 브랜드 정보 */
export interface Brand {
  id: string
  user_id: string
  brand_name: string
  hq_name: string
  consultation_date: string | null
  consultant_name: string | null
  store_type: string | null
  store_size_sqm: number | null
  expected_location: string | null
  hq_website_url: string | null
  has_disclosure_doc: boolean | null
  has_contract: boolean | null
  has_sales_estimate: boolean | null
  created_at: string
}

/** 검증 세션 (브랜드 1개당 1개) */
export interface BrandSession {
  id: string
  user_id: string
  brand_id: string
  current_step: number
  current_question_id: string | null
  status: SessionStatus
  completion_pct: number
  created_at: string
  updated_at: string
  is_premium?: boolean
  brand?: Brand
}

/** 업로드 문서 */
export interface Document {
  id: string
  session_id: string
  doc_type: DocumentType
  file_path: string
  original_filename: string
  parse_status: ParseStatus
  created_at: string
}

/** AI 문서 추출 결과 */
export interface DocumentExtraction {
  id: string
  document_id: string
  field_key: string
  extracted_value: string | null
  confidence: 'confirmed' | 'uncertain' | 'not_found'
  source_page: number | null
  source_text: string | null    // 근거 원문
  created_at: string
}

/** 리스크 계산 결과 */
export interface RiskResult {
  id: string
  session_id: string
  readiness_score: number         // 계약 준비도 (0~100)
  info_check_score: number        // 정보 확인도 (0~100)
  financial_burden_score: number  // 재무 부담도 (0~100, 높을수록 부담 큼)
  hq_transparency_score: number   // 본사 정보 투명성 (0~100)
  contract_check_score: number    // 계약조건 확인도 (0~100)
  sales_check_score: number       // 매출정보 확인도 (0~100)
  operation_fit_score: number     // 운영 적합도 (0~100)
  total_missing_risk: number      // 전체 미확인 위험 (0~100, 높을수록 위험)
  calculated_at: string
}

/** 위험 플래그 */
export interface RiskFlag {
  id: string
  session_id: string
  flag_type: RiskFlagType
  severity: RiskSeverity
  title: string
  description: string
  related_question_ids: string[]
  related_doc_fields: string[]
  created_at: string
}

/** 본사에 물어볼 자동 생성 질문 */
export interface FollowupQuestion {
  id: string
  session_id: string
  question_text: string
  context: string               // 왜 이 질문이 생성됐는지
  priority: number              // 1이 최우선
  is_answered: boolean
  created_at: string
}

/** 최종 리포트 */
export interface Report {
  id: string
  session_id: string
  share_token: string
  report_data: ReportData
  pdf_path: string | null
  verdict: FinalVerdict
  created_at: string
}

/** 리포트 내 사용자 재무 상황 */
export interface UserSituation {
  own_capital: number | null
  use_loan: string | null
  monthly_loan_payment: number | null
  has_experience: boolean | null
  operation_style: string | null
  target_monthly_profit: number | null
  monthly_living_cost: number | null
}

/** 리포트 데이터 전체 구조 */
export interface ReportData {
  brand: Brand
  risk_result: RiskResult
  top_issues: RiskFlag[]
  discrepancies: RiskFlag[]
  missing_items: RiskFlag[]
  followup_questions: FollowupQuestion[]
  document_extractions: Record<string, DocumentExtraction[]>
  user_situation: UserSituation
  verdict: FinalVerdict
  generated_at: string
}

// ── 유틸리티 ──────────────────────────────────────────────

/** 점수 레벨 판정 */
export function getScoreLevel(score: number): ScoreLevel {
  if (score < 40) return 'very_high_risk'
  if (score < 60) return 'caution'
  if (score < 80) return 'needs_check'
  return 'good'
}

/** 점수 레벨별 표시 설정 */
export const SCORE_LEVEL_CONFIG: Record<ScoreLevel, {
  label: string
  color: string
  bgColor: string
  emoji: string
}> = {
  very_high_risk: {
    label: '매우 높은 확인 필요',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    emoji: '🔴',
  },
  caution: {
    label: '주의',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    emoji: '🟠',
  },
  needs_check: {
    label: '추가 확인 권장',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    emoji: '🟡',
  },
  good: {
    label: '현재 확인수준 양호',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    emoji: '🟢',
  },
}

/** 최종 판단 메시지 */
export const VERDICT_CONFIG: Record<FinalVerdict, {
  title: string
  description: string
  color: string
  bgColor: string
}> = {
  need_more_info: {
    title: '현재 정보만으로 계약 진행 전 추가 확인 필요',
    description: '주요 항목들이 아직 확인되지 않았습니다. 계약서에 서명하기 전에 아래 미확인 항목을 먼저 점검하세요.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  mostly_confirmed: {
    title: '상당 부분 확인되었으나 일부 핵심사항 확인 필요',
    description: '대부분의 정보는 확인되었으나 일부 핵심 항목에서 추가 확인이 필요합니다.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  well_confirmed: {
    title: '주요 사항이 비교적 확인됨',
    description: '현재 입력된 정보 기준으로 주요 확인사항이 비교적 잘 확인된 상태입니다.\n단, 이는 브랜드의 품질 평가가 아니라 현재 확인 수준의 평가입니다.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  expert_consultation: {
    title: '전문가 상담을 권장할 정도의 고위험 항목 존재',
    description: '입력된 정보에서 중요한 불일치 또는 고위험 항목이 발견되었습니다. 계약 전 전문가(가맹거래사, 변호사)의 검토를 권장합니다.',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
}

/** STEP 번호 → 레이블 */
export const STEP_LABELS: Record<number, string> = {
  1: '나의 창업 상황',
  2: '관심 프랜차이즈',
  3: '본사 상담 내용',
  4: '투자금 / 비용 확인',
  5: '매출 / 수익 확인',
  6: '계약조건 확인',
  7: '본사 및 가맹점 확인',
  8: '정보공개서 / 계약서 업로드',
  9: 'AI 문서 분석',
  10: '부족한 정보 확인',
  11: '본사에게 물어볼 질문',
  12: '최종 종합 리포트',
}

/** 문서 유형 한국어 레이블 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  disclosure_doc: '정보공개서',
  contract: '가맹계약서',
  sales_estimate: '예상매출액 산정서',
  hq_material: '본사 제공자료',
  quote: '견적서',
  consultation_record: '문자/상담내용',
  other: '기타',
}

/** 금액 포맷 (원) */
export function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    const eo = Math.floor(amount / 100_000_000)
    const man = Math.floor((amount % 100_000_000) / 10_000)
    return man > 0 ? `${eo}억 ${man.toLocaleString()}만원` : `${eo}억원`
  }
  if (amount >= 10_000) {
    return `${Math.floor(amount / 10_000).toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}원`
}
