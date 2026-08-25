import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { RiskEngine } from '@/lib/risk-engine'
import type { Question, QuestionAnswer } from '@/types'
import { TEST_USER_ID } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const userId = user.id

  const { session_id } = await req.json()
  if (!session_id) return NextResponse.json({ error: 'session_id 필수' }, { status: 400 })

  // 1. 세션 및 브랜드 정보 조회
  const { data: session } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*)')
    .eq('id', session_id)
    .eq('user_id', userId)
    .single()

  if (!session) return NextResponse.json({ error: '세션 없음' }, { status: 404 })

  // 2. 전체 질문 조회
  const { data: questions } = await supabase
    .from('questions')
    .select('*, options:question_options(*)')
    .eq('is_active', true)

  // 3. 답변 조회
  const { data: answers } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', session_id)

  // answers와 answersByKey 맵 생성
  const qList = (questions ?? []) as Question[]
  const aList = (answers ?? []) as QuestionAnswer[]
  
  const answersMap: Record<string, QuestionAnswer> = {}
  const answersByKeyMap: Record<string, QuestionAnswer> = {}
  
  const keyMap: Record<string, string> = {}
  qList.forEach(q => { keyMap[q.id] = q.question_key })
  
  aList.forEach(a => {
    answersMap[a.question_id] = a
    const key = keyMap[a.question_id]
    if (key) answersByKeyMap[key] = a
  })

  // userSituation 추출
  const userSituation = {
    own_capital: Number(answersByKeyMap['own_capital']?.answer_value || 0),
    use_loan: String(answersByKeyMap['use_loan']?.answer_value || ''),
    has_experience: answersByKeyMap['has_experience']?.answer_value === 'true',
    operation_style: String(answersByKeyMap['operation_style']?.answer_value || ''),
    monthly_loan_payment: Number(answersByKeyMap['monthly_loan_payment']?.answer_value || 0),
    monthly_living_cost: Number(answersByKeyMap['monthly_living_cost']?.answer_value || 0),
    target_monthly_profit: Number(answersByKeyMap['target_monthly_profit']?.answer_value || 0),
  }

  const engine = new RiskEngine()

  try {
    const output = engine.calculate({
      sessionId: session_id,
      questions: qList,
      answers: answersMap,
      answersByKey: answersByKeyMap,
      extractions: [],
      brand: session.brand,
      userSituation
    })

    const reportData = {
      brand: session.brand,
      risk_result: output.result,
      flags: output.flags,
      followup_questions: output.followupQuestions,
      user_situation: userSituation,
    }

    // 5. DB 저장
    const { data: report, error } = await supabase
      .from('reports')
      .upsert({
        session_id,
        report_data: reportData,
        verdict: output.verdict,
      }, { onConflict: 'session_id' })
      .select()
      .single()

    if (error) {
      console.error('Report upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 상태 업데이트
    await supabase
      .from('brand_sessions')
      .update({ status: 'completed' })
      .eq('id', session_id)

    return NextResponse.json({ report, share_token: report.share_token })
  } catch (err) {
    console.error('RiskEngine calculation error:', err)
    return NextResponse.json({ error: '분석 중 오류 발생' }, { status: 500 })
  }
}
