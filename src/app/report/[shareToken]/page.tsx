import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  VERDICT_CONFIG,
  SCORE_LEVEL_CONFIG,
  getScoreLevel,
  formatKRW,
} from '@/types'
import type { ReportData, RiskFlag } from '@/types'

interface Props {
  params: Promise<{ shareToken: string }>
}

export default async function SharedReportPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('share_token', params.shareToken)
    .single()

  if (!report) notFound()

  const reportData = report.report_data as ReportData
  const verdict = report.verdict as string
  const verdictCfg = VERDICT_CONFIG[verdict as keyof typeof VERDICT_CONFIG]
  const riskResult = reportData.risk_result
  const flags: RiskFlag[] = [
    ...(reportData.top_issues ?? []),
    ...(reportData.discrepancies ?? []),
  ]
  const uniqueFlags = Array.from(new Map(flags.map((f) => [f.title, f])).values())

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 공유 배너 */}
      <div className="bg-blue-600 text-white text-center py-2 text-xs">
        이 리포트는 공유 링크로 공개된 문서입니다 — 가맹검증 서비스
      </div>

      <div className={`px-4 pt-6 pb-5 ${verdictCfg.bgColor}`}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-gray-500 mb-1">
            {reportData.brand?.brand_name} — 현재 입력된 정보 기준
          </p>
          <h1 className="text-lg font-bold text-gray-900 leading-snug">{verdictCfg.title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* 점수 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">📊 확인 수준 점수</h2>
          {[
            ['계약 준비도', riskResult?.readiness_score],
            ['정보 확인도', riskResult?.info_check_score],
            ['매출정보 확인도', riskResult?.sales_check_score],
          ].map(([label, score]) => {
            const s = Number(score ?? 0)
            const level = getScoreLevel(s)
            const cfg = SCORE_LEVEL_CONFIG[level]
            return (
              <div key={label as string} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label as string}</span>
                  <span className={`font-bold ${cfg.color}`}>{cfg.emoji} {s}점</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s}%` }} />
                </div>
              </div>
            )
          })}
        </section>

        {/* 주요 확인사항 */}
        {uniqueFlags.slice(0, 3).map((flag, i) => (
          <div key={i} className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">{flag.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{flag.description}</p>
          </div>
        ))}

        {/* 면책 */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          이 리포트는 사용자가 입력한 정보 기준으로만 분석됩니다.
          법률 자문이 아닙니다.
        </p>
      </div>
    </div>
  )
}
