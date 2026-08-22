import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SurveyPageClient from '@/components/survey/SurveyPageClient'
import type { Question, QuestionAnswer } from '@/types'
import { TEST_USER_ID } from '@/lib/utils'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function SurveyPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params

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
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*, options:question_options(*), conditions:question_conditions!question_conditions_question_id_fkey(*)')
    .eq('is_active', true)
    .order('step_number')
    .order('order_in_step')
  
  if (questionsError) {
    console.error('[SurveyPage] questions fetch error:', questionsError)
  }

  // 기존 답변 로드
  const { data: answers, error: answersError } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', sessionId)
    
  if (answersError) {
    console.error('[SurveyPage] answers fetch error:', answersError)
  }

  return (
    <SurveyPageClient
      sessionId={sessionId}
      initialQuestions={(questions ?? []) as Question[]}
      initialAnswers={(answers ?? []) as QuestionAnswer[]}
    />
  )
}
