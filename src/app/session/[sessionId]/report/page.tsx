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
import { AlertTriangle, CheckCircle2, HelpCircle, FileText, Share2, Home } from 'lucide-react'
import { TEST_USER_ID } from '@/lib/utils'
import ShareButton from '@/components/report/ShareButton'

interface Props {
  params: Promise<{ sessionId: string }>
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'border-red-200 bg-red-50',
  warning: 'border-orange-200 bg-orange-50',
  info: 'border-blue-200 bg-blue-50',
}

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="text-red-500 shrink-0" size={16} />,
  warning: <AlertTriangle className="text-orange-500 shrink-0" size={16} />,
  info: <HelpCircle className="text-blue-500 shrink-0" size={16} />,
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const level = getScoreLevel(score)
  const cfg = SCORE_LEVEL_CONFIG[level]
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-bold ${cfg.color}`}>
          {cfg.emoji} {score}점
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            level === 'good'
              ? 'bg-green-500'
              : level === 'needs_check'
              ? 'bg-yellow-500'
              : level === 'caution'
              ? 'bg-orange-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default async function ReportPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params

  // 리포트 조회
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 max-w-lg mx-auto">
        <p className="text-gray-500 mb-4">리포트가 아직 생성되지 않았습니다.</p>
        <Link
          href={`/session/${sessionId}/survey`}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold"
        >
          설문 계속하기
        </Link>
      </div>
    )
  }

  const reportData = report.report_data as ReportData
  const verdict = report.verdict as string
  const verdictCfg = VERDICT_CONFIG[verdict as keyof typeof VERDICT_CONFIG]
  const riskResult = reportData.risk_result
  const flags = reportData.flags ?? [...(reportData.top_issues ?? []), ...(reportData.discrepancies ?? []), ...(reportData.missing_items ?? [])]
  const uniqueFlags = Array.from(new Map(flags.map((f: RiskFlag) => [f.title, f])).values())
  const followups = reportData.followup_questions ?? []

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/report/${report.share_token}`

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className={`px-4 pt-8 pb-6 ${verdictCfg.bgColor}`}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-medium text-gray-500 mb-1">
            현재 입력된 정보 기준 분석결과
          </p>
          <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">
            {verdictCfg.title}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            {verdictCfg.description}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* 1. 점수 한눈에 보기 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">📊 점수 한눈에 보기</h2>
          <p className="text-xs text-gray-400 mb-4">
            * 이 점수는 브랜드 품질 평가가 아닙니다. 현재 확인 수준을 나타냅니다.
          </p>
          <ScoreBar label="계약 준비도" score={riskResult?.readiness_score ?? 0} />
          <ScoreBar label="정보 확인도" score={riskResult?.info_check_score ?? 0} />
          <ScoreBar label="본사 정보 투명성" score={riskResult?.hq_transparency_score ?? 0} />
          <ScoreBar label="계약조건 확인도" score={riskResult?.contract_check_score ?? 0} />
          <ScoreBar label="매출정보 확인도" score={riskResult?.sales_check_score ?? 0} />
          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">전체 미확인 위험</span>
              <span className={`text-sm font-bold ${
                (riskResult?.total_missing_risk ?? 0) >= 60 ? 'text-red-600' :
                (riskResult?.total_missing_risk ?? 0) >= 40 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {riskResult?.total_missing_risk ?? 0}점
              </span>
            </div>
          </div>
        </section>

        {/* 2. 현재 가장 중요한 문제 */}
        {uniqueFlags.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">🚨 지금 가장 중요한 확인사항</h2>
            <div className="space-y-3">
              {uniqueFlags.slice(0, 5).map((flag: RiskFlag, i: number) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 ${SEVERITY_STYLE[flag.severity]}`}
                >
                  <div className="flex gap-2 items-start">
                    {SEVERITY_ICON[flag.severity]}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{flag.title}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{flag.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. 본사에 물어볼 질문 */}
        {followups.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">❓ 본사에 확인할 질문</h2>
            <p className="text-xs text-gray-400 mb-4">
              AI가 자동 생성했습니다. 법적 판단이 아니며 추가 확인을 위한 참고용입니다.
            </p>
            <div className="space-y-3">
              {followups.slice(0, 7).map((q: { question_text: string; context: string }, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Q{i + 1}. {q.question_text}</p>
                  <p className="text-xs text-gray-400">{q.context}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. 재무 상황 분석 */}
        {reportData.user_situation && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">💰 재무 상황 기준 분석</h2>
            <div className="space-y-2 text-sm mb-4">
              {reportData.user_situation.own_capital && (
                <div className="flex justify-between">
                  <span className="text-gray-500">자기자본</span>
                  <span className="font-semibold">{formatKRW(reportData.user_situation.own_capital)}</span>
                </div>
              )}
              {reportData.user_situation.monthly_loan_payment && (
                <div className="flex justify-between">
                  <span className="text-gray-500">월 대출 원리금</span>
                  <span className="font-semibold text-orange-600">{formatKRW(reportData.user_situation.monthly_loan_payment)}</span>
                </div>
              )}
              {reportData.user_situation.monthly_living_cost && (
                <div className="flex justify-between">
                  <span className="text-gray-500">월 생활비</span>
                  <span className="font-semibold">{formatKRW(reportData.user_situation.monthly_living_cost)}</span>
                </div>
              )}
              {reportData.user_situation.target_monthly_profit && (
                <div className="flex justify-between">
                  <span className="text-gray-500">목표 월 순수익</span>
                  <span className="font-semibold text-blue-600">{formatKRW(reportData.user_situation.target_monthly_profit)}</span>
                </div>
              )}
            </div>
            
            {uniqueFlags.filter(f => f.flag_type === 'financial_risk').length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <p className="text-xs font-semibold text-gray-500">⚠️ 재무 위험 분석결과</p>
                {uniqueFlags
                  .filter(f => f.flag_type === 'financial_risk')
                  .map((flag, idx) => (
                    <div key={idx} className="bg-red-50 text-red-700 p-3 rounded-lg text-sm leading-relaxed">
                      <strong>{flag.title}</strong><br />
                      <span className="text-red-600/90 text-xs mt-1 block">{flag.description}</span>
                    </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. 면책 고지 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 leading-relaxed">
          <p className="font-semibold mb-1">⚠️ 면책 안내</p>
          이 리포트는 사용자가 입력한 정보만을 기반으로 한 참고 자료입니다.
          법률 자문이나 전문 컨설팅을 대체하지 않습니다. 계약 전 가맹거래사 또는 변호사의 검토를 권장합니다.
        </div>

        {/* 공유 버튼 */}
        <div className="flex gap-3 mt-6">
          <ShareButton shareUrl={shareUrl} />
          <Link
            href={`/session/${sessionId}/survey`}
            className="flex-1 bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
          >
            <FileText size={16} />
            답변 수정
          </Link>
        </div>

        <div className="mt-3">
          <Link
            href="/dashboard"
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Home size={16} />
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
