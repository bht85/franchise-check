'use client'

import { useState } from 'react'
import type { Question, QuestionAnswer, AnswerState, SourceType } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react'

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

// ── 금액 입력 컴포넌트 ───────────────────────────────────

function AmountInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const formatted = value
    ? Number(value.replace(/[^0-9]/g, '')).toLocaleString()
    : ''

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg font-semibold text-right pr-14 focus:border-blue-500 focus:outline-none transition-colors"
        placeholder="0"
        value={formatted}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '')
          onChange(raw)
        }}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
        원
      </span>
    </div>
  )
}

// ── 선택형 입력 ────────────────────────────────────────

function SelectInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      {question.options?.map((opt) => (
        <button
          key={opt.option_key}
          onClick={() => onChange(opt.option_key)}
          className={cn(
            'w-full text-left border-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all',
            value === opt.option_key
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          {opt.option_text}
        </button>
      ))}
    </div>
  )
}

// ── 텍스트 입력 ────────────────────────────────────────

function TextInput({
  value,
  onChange,
  placeholder = '금액, 비율 또는 내용을 자유롭게 적어주세요',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg font-medium focus:border-blue-500 focus:outline-none transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ── 답변 상태 선택기 ────────────────────────────────────

function AnswerStateSelector({
  state,
  onChange,
}: {
  state: AnswerState
  onChange: (s: AnswerState) => void
}) {
  const options: Array<{ value: AnswerState; label: string; color: string }> = [
    { value: 'confirmed', label: '확인함', color: 'green' },
    { value: 'not_checked', label: '확인 안 함', color: 'gray' },
    { value: 'unknown', label: '모름', color: 'orange' },
  ]

  return (
    <div className="flex gap-2 mt-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 text-xs font-medium py-2 rounded-lg border-2 transition-all',
            state === opt.value
              ? opt.value === 'confirmed'
                ? 'border-green-500 bg-green-50 text-green-700'
                : opt.value === 'unknown'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-400 bg-gray-100 text-gray-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
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
  const [showWhy, setShowWhy] = useState(true)
  const [localValue, setLocalValue] = useState<string>(
    currentAnswer?.answer_value != null
      ? String(currentAnswer.answer_value)
      : ''
  )
  const [localState, setLocalState] = useState<AnswerState>(
    currentAnswer?.answer_state ?? 'not_checked'
  )

  const handleValueChange = (v: string) => {
    setLocalValue(v)
    const val = question.answer_type === 'amount' ? Number(v) || null : v
    onAnswer(val, v ? 'confirmed' : 'not_checked')
    setLocalState(v ? 'confirmed' : 'not_checked')
  }

  const handleStateChange = (s: AnswerState) => {
    setLocalState(s)
    onAnswer(localValue || null, s)
  }

  const handleSelectChange = (v: string) => {
    setLocalValue(v)
    setLocalState('confirmed')
    onAnswer(v, 'confirmed')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white max-w-lg mx-auto">
      {/* 상단: 진행률 */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">{progress.stepLabel}</span>
          <span className="text-xs text-gray-400">
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* 질문 영역 */}
      <div className="flex-1 px-4 py-6 question-card-enter">
        {/* 카테고리 태그 */}
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {progress.stepLabel}
        </span>

        {/* 질문 텍스트 */}
        <h2 className="text-xl font-bold text-gray-900 mt-3 mb-5 leading-snug">
          {question.question_text}
        </h2>

        {/* 답변 입력 */}
        <div className="mb-4">
          {question.answer_type === 'amount' && (
            <>
              <AmountInput value={localValue} onChange={handleValueChange} />
              <AnswerStateSelector state={localState} onChange={handleStateChange} />
            </>
          )}
          {question.answer_type === 'select' && (
            <SelectInput
              question={question}
              value={localValue}
              onChange={handleSelectChange}
            />
          )}
          {question.answer_type === 'text' && (
            <>
              <TextInput value={localValue} onChange={handleValueChange} />
              <AnswerStateSelector state={localState} onChange={handleStateChange} />
            </>
          )}
        </div>

        {/* "왜 중요한가요?" */}
        {question.description && (
          <div className="mt-4">
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HelpCircle size={14} />
              이 질문은 왜 중요한가요?
              {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showWhy && (
              <div className="mt-2 bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700 leading-relaxed">
                {question.description}
              </div>
            )}
          </div>
        )}

        {/* 필수 항목 표시 */}
        {!question.is_required && (
          <p className="text-xs text-gray-400 mt-3">* 선택 항목입니다. 모르면 건너뛸 수 있습니다.</p>
        )}

        {/* 상황에 맞는 외부 링크 띄우기 */}
        {CONTEXTUAL_LINKS[question.question_key] && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <a
              href={CONTEXTUAL_LINKS[question.question_key].url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-between bg-white border border-gray-200 hover:border-blue-400 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-600 font-bold tracking-tight">공식 데이터 확인하기</span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {CONTEXTUAL_LINKS[question.question_key].title}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <ExternalLink size={14} />
              </div>
            </a>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-bottom">
        <div className="flex gap-3">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="flex-none border-2 border-gray-200 text-gray-600 font-medium py-3.5 px-5 rounded-xl hover:border-gray-300 transition-colors"
            >
              이전
            </button>
          )}
          <button
            onClick={onNext}
            className={cn(
              'flex-1 font-semibold py-3.5 rounded-xl transition-colors text-base',
              localState === 'confirmed' || localValue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {hasNext ? '다음' : '완료'}
          </button>
        </div>
      </div>
    </div>
  )
}
