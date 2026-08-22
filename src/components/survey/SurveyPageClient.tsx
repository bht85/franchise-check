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

  const handleNext = useCallback(() => {
    if (!currentQuestion) return
    // 엔진 답변 업데이트
    engine.updateAnswers(useSurveyStore.getState().answers)
    const next = engine.getNext(currentQuestion.id)
    if (next) {
      setCurrentQ(next)
      setCurrentQuestion(next.id)
    } else {
      // 완료 → 분석 페이지로
      router.push(`/session/${sessionId}/upload`)
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">질문을 불러오는 중입니다...</p>
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
