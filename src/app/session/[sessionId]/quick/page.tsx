import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import QuickCheckClient from '@/components/survey/QuickCheckClient'
import type { Question, QuestionAnswer } from '@/types'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function QuickCheckPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { sessionId } = await params

  // 1. 세션 확인
  const { data: session, error: sessionError } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(brand_name)')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) redirect('/dashboard')
  const brandName = session.brand?.brand_name || '브랜드'

  // 2. Quick Check 문항만 로드
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*, options:question_options(*), conditions:question_conditions!question_id(*)')
    .eq('is_active', true)
    .eq('is_quick_check', true)
    .order('step_number')
    .order('order_in_step')

  if (questionsError || !questions) {
    console.error('[QuickCheck] questions load error', questionsError)
    redirect(`/session/${sessionId}`)
  }

  // 3. 기존 답변 로드
  const { data: answers, error: answersError } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', sessionId)

  if (answersError) {
    console.error('[QuickCheck] answers load error', answersError)
  }

  return (
    <QuickCheckClient
      sessionId={sessionId}
      brandName={brandName}
      initialQuestions={questions as Question[]}
      initialAnswers={(answers ?? []) as QuestionAnswer[]}
    />
  )
}
