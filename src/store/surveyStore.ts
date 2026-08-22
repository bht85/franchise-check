'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuestionAnswer, AnswerState, SourceType } from '@/types'

// ============================================================
// Zustand 전역 상태 — 설문 진행 관리
// ============================================================

interface SurveyState {
  sessionId: string | null
  currentQuestionId: string | null
  answers: Record<string, QuestionAnswer>  // question_id → answer
  answersByKey: Record<string, QuestionAnswer>  // question_key → answer
  isSaving: boolean
  lastSavedAt: string | null

  // Actions
  setSession: (sessionId: string) => void
  setCurrentQuestion: (questionId: string) => void
  setAnswer: (answer: QuestionAnswer, questionKey?: string) => void
  setAnswers: (answers: QuestionAnswer[], questionKeyMap: Record<string, string>) => void
  setSaving: (saving: boolean) => void
  reset: () => void
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      sessionId: null,
      currentQuestionId: null,
      answers: {},
      answersByKey: {},
      isSaving: false,
      lastSavedAt: null,

      setSession: (sessionId) => set({ sessionId }),

      setCurrentQuestion: (questionId) => set({ currentQuestionId: questionId }),

      setAnswer: (answer, questionKey) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [answer.question_id]: answer,
          },
          answersByKey: questionKey
            ? { ...state.answersByKey, [questionKey]: answer }
            : state.answersByKey,
          lastSavedAt: new Date().toISOString(),
        })),

      setAnswers: (answers, questionKeyMap) =>
        set((state) => {
          const newAnswers = { ...state.answers }
          const newAnswersByKey = { ...state.answersByKey }
          for (const a of answers) {
            newAnswers[a.question_id] = a
            const key = questionKeyMap[a.question_id]
            if (key) newAnswersByKey[key] = a
          }
          return { answers: newAnswers, answersByKey: newAnswersByKey }
        }),

      setSaving: (saving) => set({ isSaving: saving }),

      reset: () =>
        set({
          sessionId: null,
          currentQuestionId: null,
          answers: {},
          answersByKey: {},
          isSaving: false,
          lastSavedAt: null,
        }),
    }),
    {
      name: 'franchise-check-survey',
      partialize: (state) => ({
        sessionId: state.sessionId,
        currentQuestionId: state.currentQuestionId,
        answers: state.answers,
        answersByKey: state.answersByKey,
      }),
    }
  )
)

// 답변 저장 헬퍼 (API 호출)
export async function saveAnswer(params: {
  sessionId: string
  questionId: string
  questionKey: string
  value: unknown
  state: AnswerState
  sourceType?: SourceType
}) {
  const res = await fetch('/api/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: params.sessionId,
      question_id: params.questionId,
      answer_value: params.value,
      answer_state: params.state,
      source_type: params.sourceType ?? null,
    }),
  })
  if (!res.ok) throw new Error('답변 저장 실패')
  const data = await res.json()
  return data.answer as QuestionAnswer
}
