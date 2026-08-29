import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  VERDICT_CONFIG,
  SCORE_LEVEL_CONFIG,
  getScoreLevel,
  formatKRW,
} from '@/types'
import type { ReportData, RiskFlag } from '@/types'
import { AlertTriangle, CheckCircle2, HelpCircle, FileText, Home } from 'lucide-react'
import { TEST_USER_ID } from '@/lib/utils'
import ShareButton from '@/components/report/ShareButton'
import PremiumUpsell from '@/components/report/PremiumUpsell'
import { CopyButton } from '@/components/report/CopyButton'

interface Props {
  params: Promise<{ sessionId: string }>
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const level = getScoreLevel(score)
  const cfg = SCORE_LEVEL_CONFIG[level]
  const barColor = level === 'good' ? 'bg-green-500' : level === 'needs_check' ? 'bg-yellow-500' : level === 'caution' ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[#737983]">{label}</span>
        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.emoji} {score}점</span>
      </div>
      <div className="w-full bg-[#E5E7EB] rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="text-red-500 shrink-0" size={16} />,
  warning: <AlertTriangle className="text-amber-500 shrink-0" size={16} />,
  info: <HelpCircle className="text-blue-500 shrink-0" size={16} />,
}

export default async function ReportPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params

  const { data: session } = await supabase
    .from('brand_sessions')
    .select('status, is_premium')
    .eq('id', sessionId)
    .single()

  if (!session) notFound()

  const isPremiumCompleted = session.status === 'premium_completed'

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-12 border border-[#E5E7EB] text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText className="text-indigo-500" size={24} />
          </div>
          <p className="font-semibold text-[#171A1F] mb-2">리포트가 아직 없습니다</p>
          <p className="text-sm text-[#737983] mb-6">설문을 완료하면 자동으로 생성됩니다.</p>
          <Link href={`/session/${sessionId}`} className="block w-full bg-indigo-600 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            카테고리 허브로 가기
          </Link>
        </div>
      </div>
    )
  }

  const reportData = report.report_data as ReportData
  const verdict = report.verdict as string
  const verdictCfg = VERDICT_CONFIG[verdict as keyof typeof VERDICT_CONFIG]
  const riskResult = reportData.risk_result
  const flags = ((reportData as any).flags ?? [...((reportData as any).top_issues ?? []), ...((reportData as any).discrepancies ?? []), ...((reportData as any).missing_items ?? [])]) as RiskFlag[]
  const uniqueFlags = Array.from(new Map(flags.map((f: RiskFlag) => [f.title, f])).values()) as RiskFlag[]
  const followups = (reportData.followup_questions ?? []) as Array<{ question_text: string; context: string }>

  const criticalFlags = uniqueFlags.filter((f: RiskFlag) => f.severity === 'critical')
  const warningFlags = uniqueFlags.filter((f: RiskFlag) => f.severity === 'warning')
  const infoFlags = uniqueFlags.filter((f: RiskFlag) => f.severity === 'info')

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/report/${report.share_token}`
  const readinessScore = riskResult?.readiness_score ?? 0

  return (
    <div className="min-h-screen bg-[#F6F7F9]">

      {/* ── Hero Section ── */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-6 py-14 md:py-20 text-center">
          <p className="text-xs font-semibold text-[#737983] uppercase tracking-wider mb-4">
            가맹계약 준비 상태
          </p>
          {reportData.brand?.brand_name && (
            <p className="text-sm text-[#737983] mb-3">{reportData.brand.brand_name}</p>
          )}
          <div className="text-8xl md:text-9xl font-black text-[#171A1F] leading-none mb-5 tabular-nums">
            {readinessScore}
          </div>
          <div
            className="inline-block font-semibold text-sm px-5 py-2 rounded-full border-2 mb-6"
            style={{
              borderColor: verdictCfg?.bgColor?.includes('green') ? '#16A34A' : verdictCfg?.bgColor?.includes('red') ? '#DC2626' : verdictCfg?.bgColor?.includes('orange') ? '#D97706' : '#4F46E5',
              color: verdictCfg?.bgColor?.includes('green') ? '#16A34A' : verdictCfg?.bgColor?.includes('red') ? '#DC2626' : verdictCfg?.bgColor?.includes('orange') ? '#D97706' : '#4F46E5',
            }}
          >
            {verdictCfg?.title ?? verdict}
          </div>
          <p className="text-base text-[#737983] leading-relaxed max-w-lg mx-auto">
            {verdictCfg?.description}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── 요약 3 카드 ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { count: criticalFlags.length, label: '즉시 확인', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
            { count: warningFlags.length, label: '추가 확인', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { count: infoFlags.length, label: '참고 사항', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} border rounded-2xl p-4 md:p-5 text-center`}>
              <div className={`text-3xl md:text-4xl font-black ${item.color} mb-1`}>{item.count}</div>
              <div className="text-xs text-[#737983] font-medium">{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── 즉시 확인하세요 (critical) ── */}
        {criticalFlags.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <h2 className="font-bold text-[#171A1F]">즉시 확인하세요</h2>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
              {criticalFlags.map((flag: RiskFlag, i: number) => (
                <div key={i} className="px-6 py-5 border-b border-[#E5E7EB] last:border-0 flex gap-4 items-start">
                  <span className="text-xs font-black text-red-200 text-lg leading-none mt-0.5 shrink-0 w-6 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {SEVERITY_ICON['critical']}
                      <p className="font-semibold text-[#171A1F] text-sm">{flag.title}</p>
                    </div>
                    <p className="text-xs text-[#737983] leading-relaxed">{flag.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 추가 확인 권장 (warning) ── */}
        {warningFlags.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <h2 className="font-bold text-[#171A1F]">추가 확인 권장</h2>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
              {warningFlags.map((flag: RiskFlag, i: number) => (
                <div key={i} className="px-6 py-5 border-b border-[#E5E7EB] last:border-0 flex gap-4 items-start">
                  <span className="text-xs font-black text-amber-200 text-lg leading-none mt-0.5 shrink-0 w-6 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {SEVERITY_ICON['warning']}
                      <p className="font-semibold text-[#171A1F] text-sm">{flag.title}</p>
                    </div>
                    <p className="text-xs text-[#737983] leading-relaxed">{flag.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 참고 사항 (info) ── */}
        {infoFlags.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <h2 className="font-bold text-[#171A1F]">참고 사항</h2>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              {infoFlags.map((flag: RiskFlag, i: number) => (
                <div key={i} className="px-6 py-4 border-b border-[#E5E7EB] last:border-0 flex gap-3 items-start">
                  {SEVERITY_ICON['info']}
                  <div>
                    <p className="font-medium text-[#171A1F] text-sm">{flag.title}</p>
                    <p className="text-xs text-[#737983] mt-0.5 leading-relaxed">{flag.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 본사에 물어볼 질문 ── */}
        {followups.length > 0 && (
          <section>
            <h2 className="font-bold text-[#171A1F] mb-1">본사에 확인할 질문</h2>
            <p className="text-xs text-[#737983] mb-4">AI가 자동 생성했습니다. 법적 판단이 아닌 참고용입니다.</p>
            <div className="space-y-3">
              {followups.slice(0, 7).map((q, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-[#E5E7EB] relative overflow-hidden">
                  <span className="absolute right-4 top-4 text-6xl font-black text-gray-100/60 leading-none tabular-nums select-none z-0 pointer-events-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative z-10">
                    <p className="font-semibold text-[#171A1F] text-sm mb-1 pr-12 leading-snug break-keep">{q.question_text}</p>
                    <p className="text-xs text-[#737983] mb-4 leading-relaxed break-keep">{q.context}</p>
                    <CopyButton text={q.question_text} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 점수 상세 ── */}
        <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <h2 className="font-bold text-[#171A1F] mb-1">점수 상세</h2>
          <p className="text-xs text-[#737983] mb-5">브랜드 품질 평가가 아닌 현재 확인 수준입니다.</p>
          <ScoreBar label="계약 준비도" score={riskResult?.readiness_score ?? 0} />
          <ScoreBar label="정보 확인도" score={riskResult?.info_check_score ?? 0} />
          <ScoreBar label="본사 정보 투명성" score={riskResult?.hq_transparency_score ?? 0} />
          <ScoreBar label="계약조건 확인도" score={riskResult?.contract_check_score ?? 0} />
          <ScoreBar label="매출정보 확인도" score={riskResult?.sales_check_score ?? 0} />
          <div className="border-t border-[#E5E7EB] pt-4 mt-2 flex justify-between">
            <span className="text-sm font-semibold text-[#737983]">전체 미확인 위험</span>
            <span className={`text-sm font-bold ${(riskResult?.total_missing_risk ?? 0) >= 60 ? 'text-red-600' : (riskResult?.total_missing_risk ?? 0) >= 40 ? 'text-amber-600' : 'text-green-600'}`}>
              {riskResult?.total_missing_risk ?? 0}점
            </span>
          </div>
        </section>

        {/* ── 재무 상황 ── */}
        {reportData.user_situation && (
          <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <h2 className="font-bold text-[#171A1F] mb-4">재무 상황 기준 분석</h2>
            <div className="space-y-3 text-sm">
              {reportData.user_situation.own_capital && (
                <div className="flex justify-between">
                  <span className="text-[#737983]">자기자본</span>
                  <span className="font-semibold text-[#171A1F]">{formatKRW(reportData.user_situation.own_capital)}</span>
                </div>
              )}
              {reportData.user_situation.monthly_loan_payment && (
                <div className="flex justify-between">
                  <span className="text-[#737983]">월 대출 원리금</span>
                  <span className="font-semibold text-amber-600">{formatKRW(reportData.user_situation.monthly_loan_payment)}</span>
                </div>
              )}
              {reportData.user_situation.monthly_living_cost && (
                <div className="flex justify-between">
                  <span className="text-[#737983]">월 생활비</span>
                  <span className="font-semibold text-[#171A1F]">{formatKRW(reportData.user_situation.monthly_living_cost)}</span>
                </div>
              )}
              {reportData.user_situation.target_monthly_profit && (
                <div className="flex justify-between">
                  <span className="text-[#737983]">목표 월 순수익</span>
                  <span className="font-semibold text-indigo-600">{formatKRW(reportData.user_situation.target_monthly_profit)}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 프리미엄 업셀 ── */}
        {!isPremiumCompleted && <PremiumUpsell sessionId={sessionId} />}

        {/* ── 면책 고지 ── */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-xs text-amber-700 leading-relaxed">
          <p className="font-semibold mb-1">⚠️ 면책 안내</p>
          이 리포트는 사용자가 입력한 정보만을 기반으로 한 참고 자료입니다.
          법률 자문이나 전문 컨설팅을 대체하지 않습니다. 계약 전 가맹거래사 또는 변호사의 검토를 권장합니다.
        </div>

        {/* ── 액션 버튼 ── */}
        <div className="flex gap-3">
          <ShareButton shareUrl={shareUrl} />
          <Link
            href={`/session/${sessionId}`}
            className="flex-1 bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <FileText size={16} />
            답변 수정
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="w-full bg-white border border-[#E5E7EB] text-[#737983] font-semibold py-3.5 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center gap-2 text-sm transition-colors"
        >
          <Home size={16} />
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  )
}