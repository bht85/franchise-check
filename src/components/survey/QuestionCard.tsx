'use client'

import { useState, useEffect } from 'react'
import type { Question, QuestionAnswer, AnswerState, SourceType } from '@/types'
import { cn } from '@/lib/utils'
import { HelpCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { SelectableCard } from '@/components/ui/SelectableCard'
import { AmountField } from '@/components/ui/AmountField'
import { ProgressChapter } from '@/components/ui/ProgressChapter'

interface QuestionCardProps {
  question: Question
  currentAnswer?: QuestionAnswer
  onAnswer: (value: unknown, state: AnswerState, sourceType?: SourceType) => void
  onNext: () => void
  onPrevious: () => void
  hasPrevious: boolean
  hasNext: boolean
  progress: { current: number; total: number; percentage: number; stepLabel: string }
}

// ── 관련 외부 링크 매핑 ────────────────────────────────
const CONTEXTUAL_LINKS: Record<string, { title: string; url: string }> = {
  has_disclosure_doc: { title: '공정거래위원회 가맹사업정보제공시스템', url: 'https://franchise.ftc.go.kr/' },
  disclosure_avg_sales: { title: '공정위 가맹사업정보 (매출 조회)', url: 'https://franchise.ftc.go.kr/' },
  hq_financial_status: { title: '공정위 가맹사업정보 (본사 재무 조회)', url: 'https://franchise.ftc.go.kr/' },
  building_registry_checked: { title: '정부24 건축물대장 무료 발급', url: 'https://www.gov.kr/portal/main/nologin' },
  store_usage_fit: { title: '정부24 건축물대장 무료 발급', url: 'https://www.gov.kr/portal/main/nologin' },
  real_estate_register_checked: { title: '대법원 인터넷등기소 (등기부등본 열람)', url: 'http://www.iros.go.kr/' },
  commercial_area_analysis: { title: '소상공인시장진흥공단 상권정보', url: 'https://sg.sbiz.or.kr/' },
}

// ── 메인 QuestionCard ─────────────────────────────────

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  progress,
}: QuestionCardProps) {
  const [localValue, setLocalValue] = useState<string>(
    currentAnswer?.answer_value != null
      ? String(currentAnswer.answer_value)
      : ''
  )
  const [localState, setLocalState] = useState<AnswerState>(
    currentAnswer?.answer_state ?? 'not_checked'
  )
  const [hasInteracted, setHasInteracted] = useState(false)

  // 다음으로 넘어가기 전 스킵 처리
  const handleNextClick = () => {
    if (!hasInteracted && currentAnswer === undefined) {
      onAnswer(null, 'not_checked')
    }
    onNext()
  }

  // Enter 키로 다음 이동
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target instanceof HTMLInputElement === false) {
        handleNextClick()
      }
      if (e.key === 'Enter' && question.answer_type !== 'select') {
        handleNextClick()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [hasInteracted, currentAnswer, question.answer_type, onAnswer, onNext])

  const handleValueChange = (v: string) => {
    setHasInteracted(true)
    setLocalValue(v)
    const val = question.answer_type === 'amount' ? Number(v) || null : v
    onAnswer(val, v ? 'confirmed' : 'not_checked')
    setLocalState(v ? 'confirmed' : 'not_checked')
  }

  const handleStateChange = (s: AnswerState) => {
    setHasInteracted(true)
    setLocalState(s)
    onAnswer(localValue || null, s)
  }

  const handleSelectChange = (v: string) => {
    setLocalValue(v)
    setLocalState('confirmed')
    onAnswer(v, 'confirmed')
  }

  const isAnswered = 
    localState === 'confirmed' || 
    localState === 'unknown' || 
    hasInteracted || 
    currentAnswer !== undefined || 
    (localValue && localValue.length > 0)

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* 상단: 진행률 */}
      <ProgressChapter
        current={progress.current}
        total={progress.total}
        percentage={progress.percentage}
        stepLabel={progress.stepLabel}
      />

      {/* 중앙: 질문 카드 */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 md:py-14">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-[#E5E7EB] p-8 md:p-12">
          {/* 질문 텍스트 */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#171A1F] leading-snug mb-8 mt-2 break-keep">
            {question.question_text.split('\n').map((line, i) => (
              <span 
                key={i} 
                className={i > 0 ? "block text-base font-medium text-red-500 mt-2" : ""}
              >
                {line}
              </span>
            ))}
          </h2>

          {/* 답변 입력 영역 */}
          <div className="mb-6">
            {question.answer_type === 'amount' && (
              <AmountField value={localValue} onChange={handleValueChange} />
            )}
            {question.answer_type === 'select' && (
              <div className="space-y-3">
                {question.options?.map((opt) => (
                  <SelectableCard
                    key={opt.option_key}
                    option_key={opt.option_key}
                    option_text={opt.option_text}
                    selected={localValue === opt.option_key}
                    onClick={() => handleSelectChange(opt.option_key)}
                  />
                ))}
              </div>
            )}
            {question.answer_type === 'text' && (
              <div className="border-b-2 border-[#E5E7EB] focus-within:border-indigo-500 transition-colors pb-3">
                <input
                  type="text"
                  className="w-full text-xl font-semibold text-[#171A1F] bg-transparent border-0 outline-none placeholder:text-[#E5E7EB]"
                  placeholder="금액, 비율 또는 내용을 자유롭게 적어주세요"
                  value={localValue}
                  onChange={(e) => handleValueChange(e.target.value)}
                />
              </div>
            )}
          </div>

          <p className="text-[13px] text-[#737983] mb-6 ml-1">
            * 모르시거나 아직 확인 전이라면 비워두고 다음으로 넘어가셔도 됩니다.
          </p>

          {/* 왜 중요한가요? (항상 표시) */}
          {question.description && (
            <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-2">
                <HelpCircle size={14} />
                왜 확인해야 하나요?
              </div>
              <div className="text-sm text-[#737983] leading-relaxed">
                {question.description}
              </div>
            </div>
          )}

          {/* 상황에 맞는 외부 링크 */}
          {CONTEXTUAL_LINKS[question.question_key] && (
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <a
                href={CONTEXTUAL_LINKS[question.question_key].url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 px-5 py-4 rounded-2xl transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-indigo-400 block mb-0.5">공식 확인처</span>
                  <span className="text-sm font-semibold text-indigo-700 group-hover:text-indigo-800">
                    {CONTEXTUAL_LINKS[question.question_key].title}
                  </span>
                </div>
                <ExternalLink size={16} className="text-indigo-400 shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex gap-3 items-center">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="border-2 border-[#E5E7EB] text-[#737983] font-medium py-3.5 px-6 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNextClick}
            className={cn(
              'flex-1 font-semibold py-3.5 rounded-2xl transition-all text-base flex items-center justify-center gap-2',
              isAnswered
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-[#E5E7EB] text-[#737983] hover:bg-gray-200'
            )}
          >
            {hasNext ? '다음' : '완료'}
            <ArrowRight size={18} />
          </button>
          <span className="hidden md:block text-xs text-[#737983] shrink-0">
            Enter ↵
          </span>
        </div>
      </div>
    </div>
  )
}
