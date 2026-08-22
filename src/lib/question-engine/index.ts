import type { Question, QuestionAnswer, QuestionCondition } from '@/types'
import { STEP_LABELS } from '@/types'

// ============================================================
// 질문 엔진: 조건부 질문 흐름, 진행률 계산, 네비게이션
// ============================================================

export interface QuestionEngineOptions {
  questions: Question[]
  answers: Record<string, QuestionAnswer>  // question_id → answer
}

export class QuestionEngine {
  private questions: Question[]
  private answers: Record<string, QuestionAnswer>

  constructor(options: QuestionEngineOptions) {
    this.questions = [...options.questions].sort((a, b) => {
      if (a.step_number !== b.step_number) return a.step_number - b.step_number
      return a.order_in_step - b.order_in_step
    })
    this.answers = options.answers
  }

  /** 답변이 업데이트될 때 엔진 상태를 갱신 */
  updateAnswers(answers: Record<string, QuestionAnswer>): void {
    this.answers = answers
  }

  // ── 내부: 조건 평가 ────────────────────────────────────

  /**
   * 특정 질문이 현재 답변 상태에서 표시되어야 하는지 판단
   * - conditions가 없으면 항상 표시
   * - conditions가 있으면 하나라도 만족해야 표시 (OR 조건)
   */
  private shouldShow(question: Question): boolean {
    if (!question.conditions || question.conditions.length === 0) {
      return true
    }
    return question.conditions.some((condition) => {
      const parentAnswer = this.getAnswerByQuestionId(condition.parent_question_id)
      if (!parentAnswer) return false
      const value = parentAnswer.answer_value
      if (typeof value === 'string') return value === condition.trigger_option_key
      if (Array.isArray(value)) return value.includes(condition.trigger_option_key)
      return false
    })
  }

  /** 헬퍼: question_id로 답변 가져오기 */
  private getAnswerByQuestionId(questionId: string): QuestionAnswer | undefined {
    return this.answers[questionId]
  }

  /** 현재 답변 기준으로 실제 표시될 질문 목록 (순서 유지) */
  buildQueue(): Question[] {
    return this.questions.filter((q) => q.is_active && this.shouldShow(q))
  }

  // ── 네비게이션 ─────────────────────────────────────────

  /** 첫 번째 질문 */
  getFirst(): Question | null {
    const queue = this.buildQueue()
    return queue[0] ?? null
  }

  /** 다음 질문 */
  getNext(currentQuestionId: string): Question | null {
    const queue = this.buildQueue()
    const idx = queue.findIndex((q) => q.id === currentQuestionId)
    if (idx === -1 || idx >= queue.length - 1) return null
    return queue[idx + 1]
  }

  /** 이전 질문 */
  getPrevious(currentQuestionId: string): Question | null {
    const queue = this.buildQueue()
    const idx = queue.findIndex((q) => q.id === currentQuestionId)
    if (idx <= 0) return null
    return queue[idx - 1]
  }

  /** 완료 여부 */
  isComplete(currentQuestionId: string): boolean {
    const queue = this.buildQueue()
    const idx = queue.findIndex((q) => q.id === currentQuestionId)
    return idx === queue.length - 1
  }

  // ── 진행률 ─────────────────────────────────────────────

  /** 진행률 계산 */
  getProgress(currentQuestionId: string): {
    current: number      // 현재 번호 (1-indexed)
    total: number        // 전체 질문 수
    percentage: number   // 0~100
    step: number         // 현재 STEP 번호
    stepLabel: string    // STEP 한국어 레이블
  } {
    const queue = this.buildQueue()
    const idx = queue.findIndex((q) => q.id === currentQuestionId)
    const current = idx === -1 ? 1 : idx + 1
    const total = Math.max(queue.length, 1)
    const currentQ = queue[idx] ?? queue[0]
    const step = currentQ?.step_number ?? 1

    return {
      current,
      total,
      percentage: Math.round((current / total) * 100),
      step,
      stepLabel: STEP_LABELS[step] ?? `STEP ${step}`,
    }
  }

  /** 미답변 필수 질문 목록 */
  getUnansweredRequired(): Question[] {
    return this.buildQueue().filter((q) => {
      if (!q.is_required) return false
      const answer = this.answers[q.id]
      return !answer || answer.answer_state === 'not_checked'
    })
  }

  /** 특정 STEP의 완료율 */
  getStepCompletionRate(stepNumber: number): number {
    const queue = this.buildQueue().filter((q) => q.step_number === stepNumber)
    if (queue.length === 0) return 100
    const answered = queue.filter((q) => {
      const a = this.answers[q.id]
      return a && a.answer_state !== 'not_checked'
    })
    return Math.round((answered.length / queue.length) * 100)
  }

  /** 특정 question_key로 질문 찾기 */
  findByKey(key: string): Question | undefined {
    return this.questions.find((q) => q.question_key === key)
  }

  /** question_id로 질문 찾기 */
  findById(id: string): Question | undefined {
    return this.questions.find((q) => q.id === id)
  }
}
