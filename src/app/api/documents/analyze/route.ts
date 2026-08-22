import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { extractFromDocument } from '@/lib/document-parser/extractor'
import type { DocumentType } from '@/types'

// POST /api/documents/analyze — PDF 분석
export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const body = await req.json()
  const { document_id } = body

  if (!document_id) {
    return NextResponse.json({ error: 'document_id 필수' }, { status: 400 })
  }

  // 문서 조회
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', document_id)
    .single()

  if (docError || !doc) {
    return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 })
  }

  // 소유권 확인
  const sessionData = doc.session as { user_id: string } | null
  if (sessionData?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 파싱 상태 업데이트 → processing
  await supabase
    .from('documents')
    .update({ parse_status: 'processing' })
    .eq('id', document_id)

  try {
    // Supabase Storage에서 파일 다운로드
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(doc.file_path as string)

    if (fileError || !fileData) {
      throw new Error('파일을 불러올 수 없습니다.')
    }

    // PDF → 텍스트 추출
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let text = ''

    try {
      // pdf-parse를 동적 import로 사용
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)
      text = pdfData.text as string
    } catch {
      // pdf-parse 실패 시 raw 텍스트 변환 시도
      text = buffer.toString('utf-8').replace(/[^\x20-\x7E\uAC00-\uD7A3\u3131-\u314E\u314F-\u3163]/g, ' ')
    }

    if (!text || text.trim().length < 50) {
      throw new Error('문서에서 텍스트를 추출할 수 없습니다. OCR이 필요한 스캔 문서일 수 있습니다.')
    }

    // AI 추출
    const extractions = await extractFromDocument(text, doc.doc_type as DocumentType, openai)

    // 기존 추출 결과 삭제
    await supabase.from('document_extractions').delete().eq('document_id', document_id)

    // 새 추출 결과 저장
    const insertData = extractions.map((e) => ({
      document_id,
      field_key: e.field_key,
      extracted_value: e.extracted_value,
      confidence: e.confidence,
      source_page: e.source_page,
      source_text: e.source_text,
    }))

    const { error: insertError } = await supabase
      .from('document_extractions')
      .insert(insertData)

    if (insertError) throw new Error(insertError.message)

    // 파싱 완료
    await supabase
      .from('documents')
      .update({ parse_status: 'done' })
      .eq('id', document_id)

    const confirmedCount = extractions.filter((e) => e.confidence === 'confirmed').length

    return NextResponse.json({
      success: true,
      extraction_count: confirmedCount,
      total_fields: extractions.length,
      extractions: extractions.filter((e) => e.confidence !== 'not_found'),
    })
  } catch (error) {
    await supabase
      .from('documents')
      .update({ parse_status: 'failed' })
      .eq('id', document_id)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
