import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { TEST_USER_ID } from '@/lib/utils'

// GET /api/answers?session_id=...
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const userId = user.id

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id 필수' }, { status: 400 })
  }

  // 세션 소유권 확인
  const { data: session } = await supabase
    .from('brand_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!session) return NextResponse.json({ error: '세션 없음' }, { status: 404 })

  const { data: answers, error } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', sessionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ answers })
}

// POST /api/answers — 답변 저장 (upsert)
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const userId = user.id

  const body = await req.json()
  const { session_id, question_id, answer_value, answer_state, source_type } = body

  if (!session_id || !question_id || !answer_state) {
    return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
  }

  // 세션 소유권 확인
  const { data: session } = await supabase
    .from('brand_sessions')
    .select('id')
    .eq('id', session_id)
    .eq('user_id', userId)
    .single()

  if (!session) return NextResponse.json({ error: '세션 없음' }, { status: 404 })

  // 답변 upsert
  const { data: answer, error } = await supabase
    .from('question_answers')
    .upsert({
      session_id,
      question_id,
      answer_value,
      answer_state,
      source_type: source_type || null,
    }, { onConflict: 'session_id, question_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ answer })
}
