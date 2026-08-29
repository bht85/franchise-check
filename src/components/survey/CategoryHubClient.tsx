'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Question, QuestionAnswer } from '@/types'
import { QuestionEngine } from '@/lib/question-engine'

// ── 카테고리 설정 ──────────────────────────────────────────────
const CATEGORIES = [
  { step: 1, label: '나의 창업 상황', icon: '💰', desc: '자금 규모, 경험, 운영 방식' },
  { step: 3, label: '본사 상담 내용', icon: '🤝', desc: '상담 내용 및 본사 신뢰도' },
  { step: 4, label: '투자금/비용 확인', icon: '💵', desc: '초기 투자비용 및 월 고정비' },
  { step: 5, label: '매출/수익 확인', icon: '📊', desc: '예상 매출 및 손익분기점' },
  { step: 6, label: '계약조건 확인', icon: '📋', desc: '계약 기간, 위약금, 갱신 조건' },
  { step: 7, label: '본사/가맹점 확인', icon: '🔍', desc: '실제 가맹점 방문 및 본사 검증' },
] as const

// ── 점수 레이블 ────────────────────────────────────────────────
function getScoreLabel(score: number) {
  if (score >= 75) return { label: '양호', color: 'text-green-600', bg: 'bg-green-50', emoji: '🟢' }
  if (score >= 50) return { label: '추가 확인 필요', color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '🟡' }
  if (score >= 30) return { label: '주의', color: 'text-orange-600', bg: 'bg-orange-50', emoji: '🟠' }
  return { label: '확인 필요', color: 'text-red-600', bg: 'bg-red-50', emoji: '🔴' }
}

// ── Props ──────────────────────────────────────────────────────
export interface NewsItem {
  title: string;
  link: string;
  date: string;
}

interface Props {
  sessionId: string
  brandName: string
  hqName: string
  initialQuestions: Question[]
  initialAnswers: QuestionAnswer[]
  justCompletedStep: number | null
  latestNews?: NewsItem[]
}

export default function CategoryHubClient({
  sessionId,
  brandName,
  hqName,
  initialQuestions,
  initialAnswers,
  justCompletedStep,
  latestNews,
}: Props) {
  const router = useRouter()
  const [isReportLoading, setIsReportLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  // answers를 Map으로 변환 (question_id → QuestionAnswer)
  const answersMap = useMemo(() => {
    const map: Record<string, QuestionAnswer> = {}
    for (const a of initialAnswers) {
      map[a.question_id] = a
    }
    return map
  }, [initialAnswers])

  // 카테고리별 통계 계산
  const categoryStats = useMemo(() => {
    // 엔진을 통해 숨겨진 조건부 질문을 제외한 '실제 활성화된 질문 큐'를 생성
    const engine = new QuestionEngine({
      questions: initialQuestions,
      answers: answersMap,
    })
    const activeQueue = engine.buildQueue()

    return CATEGORIES.map((cat) => {
      // 해당 카테고리(스텝)의 실제 질문들
      const questions = activeQueue.filter((q) => q.step_number === cat.step)
      const totalCount = questions.length

      const answeredCount = questions.filter((q) => {
        const a = answersMap[q.id]
        return a && (a.answer_state === 'confirmed' || a.answer_state === 'unknown')
      }).length

      const completionPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

      // 가중치 기반 점수
      const totalWeight = questions.reduce((s, q) => s + q.risk_weight, 0)
      const scoredWeight = questions.reduce((s, q) => {
        const a = answersMap[q.id]
        if (!a || a.answer_state === 'not_checked') return s
        if (a.answer_state === 'confirmed') return s + q.risk_weight
        return s + q.risk_weight * 0.4 // unknown
      }, 0)
      const score = totalWeight > 0 ? Math.round((scoredWeight / totalWeight) * 100) : 0

      return {
        ...cat,
        totalCount,
        answeredCount,
        completionPct,
        score,
      }
    })
  }, [initialQuestions, answersMap])

  // 전체 완료된 카테고리 수 (completionPct > 0인 것)
  const startedCount = categoryStats.filter((c) => c.completionPct > 0).length
  const allStarted = startedCount === CATEGORIES.length

  // 전체 진행률 (completionPct === 100인 것)
  const completedCount = categoryStats.filter((c) => c.completionPct === 100).length

  // justCompletedStep에 해당하는 카테고리명
  const justCompletedCategory = justCompletedStep
    ? CATEGORIES.find((c) => c.step === justCompletedStep)
    : null

  const handleReportClick = async () => {
    setIsReportLoading(true)
    try {
      const res = await fetch('/api/risk/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (!res.ok) throw new Error('분석 실패')
      router.push(`/session/${sessionId}/report`)
    } catch {
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsReportLoading(false)
    }
  }

  // ── 리포트 로딩 화면 ────────────────────────────────────────
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
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col">
      {/* ── 상단 헤더 ────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-[#737983] hover:text-[#171A1F] transition-colors flex items-center gap-1"
          >
            ← 대시보드
          </Link>
          <span className="font-bold text-[#171A1F] text-base truncate max-w-[200px] text-center">
            {brandName}
          </span>
          <div className="w-20" />
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* ── 브랜드 정보 카드 ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-6 py-5">
          <p className="text-xs font-semibold text-[#737983] uppercase tracking-wider mb-1">검증 중인 브랜드</p>
          <h1 className="text-2xl font-bold text-[#171A1F] leading-tight">{brandName}</h1>
          <p className="text-sm text-[#737983] mt-0.5">{hqName}</p>
        </div>

        {/* ── 완료 배너 ────────────────────────────────────── */}
        {justCompletedCategory && showBanner && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-green-700">
              ✅ {justCompletedCategory.icon} {justCompletedCategory.label} 완료! 다음 카테고리를 선택하세요.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-green-500 hover:text-green-700 text-lg leading-none flex-shrink-0"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        )}

        {/* ── 전체 진행률 ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#171A1F]">전체 진행률</p>
            <p className="text-sm font-bold text-indigo-600">
              {completedCount}/{CATEGORIES.length} 카테고리 완료
            </p>
          </div>
          <div className="w-full bg-[#F6F7F9] rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / CATEGORIES.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#737983] mt-2">
            {startedCount}개 카테고리 시작됨 · {completedCount}개 완료
          </p>
        </div>

        {/* ── 카테고리 카드 그리드 ─────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categoryStats.map((cat) => {
            const scoreInfo = cat.completionPct > 0 ? getScoreLabel(cat.score) : null

            return (
              <div
                key={cat.step}
                onClick={() => router.push(`/session/${sessionId}/survey?step=${cat.step}`)}
                className="cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 text-left
                           hover:shadow-md hover:border-indigo-200 transition-all duration-200 active:scale-[0.98] flex flex-col"
              >
                {/* 상단: 아이콘 & 완료 뱃지 (우측 정렬) */}
                <div className="flex justify-between items-start w-full mb-2 min-h-[36px]">
                  <div className="text-3xl">{cat.icon}</div>
                  {cat.completionPct === 100 && (
                    <span className="bg-green-50 border border-green-200 text-green-700
                                     text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-right">
                      ✅ 완료 {scoreInfo ? `· ${scoreInfo.label}` : ''}
                    </span>
                  )}
                </div>

                {/* 레이블 및 설명 */}
                <p className="font-bold text-[#171A1F] text-sm leading-tight mb-1">{cat.label}</p>
                <p className="text-xs text-[#737983] leading-snug mb-4 min-h-[32px]">{cat.desc}</p>

                {/* 진행률 바 */}
                <div className="w-full bg-[#F6F7F9] rounded-full h-1.5 mb-2 mt-auto">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${cat.completionPct}%` }}
                  />
                </div>

                {/* 완료 개수 */}
                <p className="text-xs text-[#737983]">
                  완료: {cat.answeredCount}/{cat.totalCount}개
                </p>

                {/* 점수 뱃지 (진행 중인 경우에만 하단에 표시) */}
                {scoreInfo && cat.completionPct < 100 && cat.completionPct > 0 && (
                  <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${scoreInfo.bg} ${scoreInfo.color}`}>
                    {scoreInfo.emoji} {scoreInfo.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── 리포트 버튼 ─────────────────────────────── */}
        <div className="pb-8">
          {startedCount > 0 ? (
            <button
              onClick={handleReportClick}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl text-base
                         hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {completedCount === CATEGORIES.length ? '📊 최종 리포트 보기' : '📊 중간 점검 리포트 보기'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full bg-[#E5E7EB] text-[#737983] font-bold py-4 rounded-2xl text-base cursor-not-allowed"
              >
                📊 리포트 보기
              </button>
              <p className="text-xs text-[#737983] text-center">
                카테고리를 1개 이상 답변하시면 중간 리포트를 볼 수 있습니다
              </p>
            </div>
          )}
        </div>

        {/* ── 최신 뉴스 섹션 ─────────────────────────────── */}
        {latestNews && latestNews.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-6 py-5 mt-6 mb-8">
            <h2 className="text-sm font-bold text-[#171A1F] mb-3 flex items-center gap-1.5">
              <span className="text-lg">📰</span> {brandName} 최근 뉴스
            </h2>
            <div className="flex flex-col gap-3">
              {latestNews.map((news, idx) => (
                <a
                  key={idx}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 p-3 rounded-xl bg-[#F6F7F9] hover:bg-[#EFF1F4] transition-colors"
                >
                  <p className="text-sm font-medium text-[#171A1F] leading-snug line-clamp-2">
                    {news.title}
                  </p>
                  <p className="text-[11px] text-[#737983]">{news.date}</p>
                </a>
              ))}
            </div>
            <p className="text-[10px] text-center text-[#A0A5B1] mt-4">
              Google News 검색 결과입니다.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
