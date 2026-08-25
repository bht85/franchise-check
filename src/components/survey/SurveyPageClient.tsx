'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionEngine } from '@/lib/question-engine'
import { useSurveyStore, saveAnswer } from '@/store/surveyStore'
import QuestionCard from '@/components/survey/QuestionCard'
import type { Question, QuestionAnswer, AnswerState, SourceType } from '@/types'

interface SurveyPageClientProps {
  sessionId: string
  initialQuestions: Question[]
  initialAnswers: QuestionAnswer[]
}

export default function SurveyPageClient({
  sessionId,
  initialQuestions,
  initialAnswers,
}: SurveyPageClientProps) {
  const router = useRouter()
  const { answers, answersByKey, setSession, setCurrentQuestion, setAnswer, setAnswers, setSaving } =
    useSurveyStore()

  const [isMounted, setIsMounted] = useState(false)
  const [isReportLoading, setIsReportLoading] = useState(false)

  // 초기화
  useEffect(() => {
    setIsMounted(true)
    setSession(sessionId)
    const keyMap: Record<string, string> = {}
    for (const q of initialQuestions) {
      keyMap[q.id] = q.question_key
    }
    setAnswers(initialAnswers, keyMap)
  }, [sessionId, initialQuestions, initialAnswers, setSession, setAnswers])

  // 질문 엔진
  const engine = new QuestionEngine({
    questions: initialQuestions,
    answers,
  })

  const [currentQuestion, setCurrentQ] = useState<Question | null>(() => {
    const queue = engine.buildQueue()
    const stored = useSurveyStore.getState().currentQuestionId
    const storedQ = stored ? queue.find((q) => q.id === stored) : null
    return storedQ ?? queue[0] ?? null
  })

  const progress = currentQuestion
    ? engine.getProgress(currentQuestion.id)
    : { current: 1, total: 1, percentage: 0, step: 1, stepLabel: '시작' }

  const handleAnswer = useCallback(
    async (value: unknown, state: AnswerState, sourceType?: SourceType) => {
      if (!currentQuestion) return
      setSaving(true)
      try {
        const saved = await saveAnswer({
          sessionId,
          questionId: currentQuestion.id,
          questionKey: currentQuestion.question_key,
          value,
          state,
          sourceType,
        })
        setAnswer(saved, currentQuestion.question_key)
      } catch (err) {
        console.error('답변 저장 실패:', err)
      } finally {
        setSaving(false)
      }
    },
    [currentQuestion, sessionId, setSaving, setAnswer]
  )

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return
    // 엔진 답변 업데이트
    engine.updateAnswers(useSurveyStore.getState().answers)
    const next = engine.getNext(currentQuestion.id)
    if (next) {
      setCurrentQ(next)
      setCurrentQuestion(next.id)
    } else {
      // 완료 → 1차 리포트 생성 API 호출 후 이동
      setIsReportLoading(true)
      try {
        const res = await fetch('/api/risk/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        if (!res.ok) throw new Error('분석 실패')
        router.refresh()
        router.push(`/session/${sessionId}/report`)
      } catch (err) {
        alert('분석 중 오류가 발생했습니다.')
        setIsReportLoading(false)
      }
    }
  }, [currentQuestion, engine, sessionId, router, setCurrentQuestion])

  const handlePrevious = useCallback(() => {
    if (!currentQuestion) return
    engine.updateAnswers(useSurveyStore.getState().answers)
    const prev = engine.getPrevious(currentQuestion.id)
    if (prev) {
      setCurrentQ(prev)
      setCurrentQuestion(prev.id)
    }
  }, [currentQuestion, engine, setCurrentQuestion])

  if (!isMounted || !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#737983]">질문을 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (isReportLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-3xl p-12 shadow-sm border border-[#E5E7EB] max-w-sm w-full">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-bold text-[#171A1F] mb-2">리포트 생성 중</p>
          <p className="text-sm text-[#737983] leading-relaxed">입력하신 내용을 분석하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <QuestionCard
      key={currentQuestion.id}
      question={currentQuestion}
      currentAnswer={answers[currentQuestion.id]}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      hasPrevious={!!engine.getPrevious(currentQuestion.id)}
      hasNext={!engine.isComplete(currentQuestion.id)}
      progress={progress}
    />
  )
}
