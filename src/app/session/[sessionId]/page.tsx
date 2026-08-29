import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CategoryHubClient from '@/components/survey/CategoryHubClient'
import type { Question, QuestionAnswer } from '@/types'

interface Props {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ completed?: string }>
}

const HUB_STEPS = [1, 3, 4, 5, 6, 7]

export default async function SessionHubPage({ params, searchParams }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params
  const { completed } = await searchParams

  // 세션 + 브랜드 소유권 확인
  const { data: session, error: sessionError } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (sessionError) {
    console.error('[SessionHub] session fetch error:', sessionError)
  }

  if (!session) {
    console.error('[SessionHub] session not found, redirecting. sessionId:', sessionId, 'userId:', userId)
    redirect('/dashboard')
  }

  const brand = session.brand as { brand_name: string; hq_name: string } | null

  // 허브 대상 step의 활성 질문만 로드
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*, options:question_options(*), conditions:question_conditions!question_id(*)')
    .eq('is_active', true)
    .in('step_number', HUB_STEPS)
    .order('step_number')
    .order('order_in_step')

  if (questionsError) {
    console.error('[SessionHub] questions fetch error:', questionsError)
  }

  // 이 세션의 기존 답변 로드
  const { data: answers, error: answersError } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', sessionId)

  if (answersError) {
    console.error('[SessionHub] answers fetch error:', answersError)
  }

  const justCompletedStep = completed ? parseInt(completed, 10) : null

  return (
    <CategoryHubClient
      sessionId={sessionId}
      brandName={brand?.brand_name ?? ''}
      hqName={brand?.hq_name ?? ''}
      initialQuestions={(questions ?? []) as Question[]}
      initialAnswers={(answers ?? []) as QuestionAnswer[]}
      justCompletedStep={Number.isNaN(justCompletedStep) ? null : justCompletedStep}
    />
  )
}
