import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { DocumentType } from '@/types'
import { TEST_USER_ID } from '@/lib/utils'

// POST /api/documents — PDF 파일 업로드
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const userId = user.id

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const sessionId = formData.get('session_id') as string
  const docType = formData.get('doc_type') as DocumentType

  if (!file || !sessionId || !docType) {
    return NextResponse.json({ error: 'file, session_id, doc_type 필수' }, { status: 400 })
  }

  // 세션 소유권 확인
  const { data: session } = await supabase
    .from('brand_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!session) return NextResponse.json({ error: '세션 없음' }, { status: 404 })

  // 파일 크기 제한 (20MB)
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: '파일 크기는 20MB 이하여야 합니다.' }, { status: 400 })
  }

  // 파일 확장자 확인
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'PDF 또는 이미지 파일만 업로드 가능합니다.' }, { status: 400 })
  }

  // Supabase Storage 업로드
  const ext = file.name.split('.').pop() ?? 'pdf'
  const filePath = `${userId}/${sessionId}/${docType}_${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // DB 기록
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      session_id: sessionId,
      doc_type: docType,
      file_path: filePath,
      original_filename: file.name,
      parse_status: 'pending',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ document }, { status: 201 })
}
