'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionEngine } from '@/lib/question-engine'
import { useSurveyStore, saveAnswer } from '@/store/surveyStore'
import QuestionCard from '@/components/survey/QuestionCard'
import type { Question, QuestionAnswer, AnswerState, SourceType } from '@/types'

interface Props {
  sessionId: string
  brandName: string
  initialQuestions: Question[]
  initialAnswers: QuestionAnswer[]
}

export default function QuickCheckClient({
  sessionId,
  brandName,
  initialQuestions,
  initialAnswers,
}: Props) {
  const router = useRouter()
  const { answers, setSession, setCurrentQuestion, setAnswer, setAnswers, setSaving } = useSurveyStore()

  const [isMounted, setIsMounted] = useState(false)

  // 1. 초기화
  useEffect(() => {
    setSession(sessionId)
    
    // 키 맵 만들기 (Quick Check용이라 안 쓰이더라도 구색 맞춤)
    const keyMap: Record<string, string> = {}
    initialQuestions.forEach(q => { keyMap[q.id] = q.question_key })
    
    setAnswers(initialAnswers, keyMap)
    setIsMounted(true)
  }, [sessionId, brandName, initialAnswers, initialQuestions, setSession, setAnswers])

  // 2. 엔진 인스턴스
  const engine = useMemo(() => {
    return new QuestionEngine({ questions: initialQuestions, answers })
  }, [initialQuestions, answers])

  const activeQuestions = engine.buildQueue()

  // 3. 현재 문항 상태
  const [currentQ, setCurrentQ] = useState<Question | null>(null)

  useEffect(() => {
    if (isMounted && activeQuestions.length > 0 && !currentQ) {
      // 가장 처음 들어왔을 때, 안 푼 첫 번째 문제로 이동
      const firstUnanswered = activeQuestions.find(
        (q) => !answers[q.id] || answers[q.id].answer_state === 'not_checked'
      )
      
      if (!firstUnanswered) {
        // 다 풀었으면? 완료 처리
        router.replace(`/session/${sessionId}?quick=done`)
        return
      }

      setCurrentQ(firstUnanswered)
      setCurrentQuestion(firstUnanswered.id)
    } else if (isMounted && activeQuestions.length === 0) {
      // 조건에 의해 활성화된 Quick Check 문항이 아예 없는 경우
      router.replace(`/session/${sessionId}?quick=done`)
    }
  }, [isMounted, activeQuestions, answers, currentQ, setCurrentQuestion, router, sessionId])

  // 4. 핸들러
  const handleAnswer = useCallback(
    async (value: unknown, state: AnswerState, sourceType?: SourceType) => {
      if (!currentQ) return
      setSaving(true)
      try {
        const saved = await saveAnswer({
          sessionId,
          questionId: currentQ.id,
          questionKey: currentQ.question_key,
          value,
          state,
          
          sourceType
        })
        setAnswer(saved)
      } finally {
        setSaving(false)
      }
    },
    [currentQ, sessionId, setSaving, setAnswer]
  )

  const handleNext = useCallback(async () => {
    if (!currentQ) return
    engine.updateAnswers(useSurveyStore.getState().answers)
    const next = engine.getNext(currentQ.id)
    if (next) {
      setCurrentQ(next)
      setCurrentQuestion(next.id)
    } else {
      // 마지막 완료
      router.replace(`/session/${sessionId}?quick=done`)
    }
  }, [currentQ, engine, setCurrentQuestion, router, sessionId])

  const handlePrevious = useCallback(() => {
    if (!currentQ) return
    engine.updateAnswers(useSurveyStore.getState().answers)
    const prev = engine.getPrevious(currentQ.id)
    if (prev) {
      setCurrentQ(prev)
      setCurrentQuestion(prev.id)
    } else {
      router.push('/dashboard')
    }
  }, [currentQ, engine, setCurrentQuestion, router])

  if (!isMounted || !currentQ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const progress = engine.getProgress(currentQ.id)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={handlePrevious} className="text-gray-500 font-medium text-sm hover:text-gray-900 transition-colors">
          {engine.getPrevious(currentQ.id) ? '← 이전' : '← 취소'}
        </button>
        <span className="font-bold text-gray-900 truncate max-w-[200px]">{brandName} 빠른 진단</span>
        <div className="w-10"></div>
      </header>

      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
          <span className="text-indigo-600 flex items-center gap-1">
            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">QUICK CHECK</span>
            {progress.current} / {progress.total}
          </span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300 ease-out rounded-full" 
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 flex flex-col">
        <div className="flex-1 animate-in slide-in-from-right-4 fade-in duration-300" key={currentQ.id}>
          <QuestionCard
            question={currentQ}
            currentAnswer={answers[currentQ.id]}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasPrevious={!!engine.getPrevious(currentQ.id)}
            hasNext={!engine.isComplete(currentQ.id)}
            progress={progress}
          />
        </div>
      </main>
    </div>
  )
}
