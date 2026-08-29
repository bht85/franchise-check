export const runtime = 'edge'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SurveyPageClient from '@/components/survey/SurveyPageClient'
import type { Question, QuestionAnswer } from '@/types'
import { TEST_USER_ID } from '@/lib/utils'

interface Props {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ step?: string }>
}

export default async function SurveyPage({ params, searchParams }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params
  const { step } = await searchParams
  const stepNumber = step ? parseInt(step, 10) : null

  // 세션 소유권 확인
  const { data: session, error: sessionError } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (sessionError) {
    console.error('[SurveyPage] session fetch error:', sessionError)
  }

  if (!session) {
    console.error('[SurveyPage] session not found, redirecting to dashboard. sessionId:', sessionId, 'userId:', userId)
    redirect('/dashboard')
  }

  // 전체 활성 질문 로드
  const { data: allQuestions, error: questionsError } = await supabase
    .from('questions')
    .select('*, options:question_options(*), conditions:question_conditions!question_id(*)')
    .eq('is_active', true)
    .order('step_number')
    .order('order_in_step')
  
  if (questionsError) {
    console.error('[SurveyPage] questions fetch error:', questionsError)
  }

  // step 파라미터가 있으면 해당 step 질문만 필터링
  const questions = (allQuestions ?? []).filter((q) =>
    stepNumber != null ? q.step_number === stepNumber : true
  )

  // 기존 답변 로드
  const { data: answers, error: answersError } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', sessionId)
    
  if (answersError) {
    console.error('[SurveyPage] answers fetch error:', answersError)
  }

  let finalAnswers = (answers ?? []) as QuestionAnswer[]


  // 내 정보 (Preferences) 로드해서 채워넣기
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('user_id', userId)
    .single()
    
  if (profile?.preferences && allQuestions) {
    const prefs = profile.preferences as Record<string, any>
    
    // answers 배열에 있는 question_id 추출
    const answerQIds = new Set(finalAnswers.map(a => a.question_id))
    
    // questions 배열에서 key -> id 매핑 만들기
    const keyToId: Record<string, string> = {}
    for (const q of allQuestions) {
      keyToId[q.question_key] = q.id
    }
    
    for (const [key, val] of Object.entries(prefs)) {
      const qId = keyToId[key]
      if (qId && val !== undefined && val !== null && val !== "" && !answerQIds.has(qId)) {
        // DB엔 없지만 프리셋이 있으면 임시 주입
        finalAnswers.push({
          id: 'preset-' + key,
          session_id: sessionId,
          question_id: qId,
          answer_value: val,
          answer_state: 'confirmed',
          source_type: 'user' as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as QuestionAnswer)
      }
    }
  }



  return (
    <SurveyPageClient
      sessionId={sessionId}
      initialQuestions={questions as Question[]}
      initialAnswers={finalAnswers}
      stepNumber={stepNumber}
    />
  )
}
