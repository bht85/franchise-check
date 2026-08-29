import { redirect } from "next/navigation"
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Clock, FileText, CheckCircle2 } from 'lucide-react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { cn } from '@/lib/utils'
import type { BrandSession, Brand, ReportData } from '@/types'
import { getScoreLevel, SCORE_LEVEL_CONFIG } from '@/types'
import InsightSidebar from '@/components/dashboard/InsightSidebar'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { data: sessions, error } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*), reports(report_data)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Supabase query error:', error)
  }

  const typedSessions = (sessions ?? []) as (BrandSession & { brand: Brand; reports: { report_data: ReportData }[] })[]

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <DashboardHeader sessionCount={typedSessions.length} isPremium={typedSessions[0]?.is_premium || false} />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {typedSessions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-16 text-center">
              <div className="w-16 h-16 bg-[#F6F7F9] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="text-[#737983]" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-[#171A1F] mb-3">아직 검증한 브랜드가 없습니다</h2>
              <p className="text-[#737983] mb-8 text-sm">
                첫 번째 프랜차이즈를 검증해보세요.
              </p>
              <Link
                href="/session/new"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-colors"
              >
                새 검증 시작하기
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-[#737983] uppercase tracking-wider mb-6">내 검증 목록</p>
              <div className="space-y-4">
                {typedSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={
                      session.status === 'completed'
                        ? `/session/${session.id}/report`
                        : `/session/${session.id}`
                    }
                    className="block bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#171A1F] group-hover:text-indigo-600 transition-colors">
                          {session.brand.brand_name}
                        </h3>
                        <p className="text-sm text-[#737983] mt-0.5">{session.brand.hq_name}</p>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold px-3 py-1 rounded-full border',
                          session.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        )}
                      >
                        {session.status === 'completed' ? '완료됨' : '진행 중'}
                      </span>
                    </div>

                    {(() => {
                      const reports = session.reports as any
                      const reportData = Array.isArray(reports) ? reports[0]?.report_data : reports?.report_data

                      return (
                        <>
                          {session.status === 'in_progress' && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-[#737983] mb-2">
                                <span>진행률</span>
                                <span>{session.completion_pct}%</span>
                              </div>
                              <div className="w-full bg-[#E5E7EB] rounded-full h-1 mb-4">
                                <div
                                  className="bg-indigo-500 h-1 rounded-full transition-all"
                                  style={{ width: `${session.completion_pct}%` }}
                                />
                              </div>
                              {reportData && (() => {
                                const score = reportData.risk_result.readiness_score
                                const level = getScoreLevel(score)
                                const config = SCORE_LEVEL_CONFIG[level]
                                return (
                                  <div className={cn("p-4 rounded-xl flex items-center justify-between border border-opacity-20", config.bgColor, config.color.replace('text-', 'border-'))}>
                                    <div className="flex flex-col">
                                      <span className={cn("text-xs font-semibold mb-1", config.color)}>중간 점검 점수</span>
                                      <span className="text-2xl font-bold text-[#171A1F] leading-none">{score}<span className="text-sm font-medium text-[#737983] ml-0.5">점</span></span>
                                    </div>
                                    <div className={cn("text-sm font-bold px-3 py-1 rounded-full", config.bgColor, config.color, "mix-blend-multiply opacity-90")}>
                                      {config.label}
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          )}

                          {session.status === 'completed' && reportData && (() => {
                            const score = reportData.risk_result.readiness_score
                            const level = getScoreLevel(score)
                            const config = SCORE_LEVEL_CONFIG[level]
                            return (
                              <div className={cn("mb-4 p-4 rounded-xl flex items-center justify-between border border-opacity-20", config.bgColor, config.color.replace('text-', 'border-'))}>
                                <div className="flex flex-col">
                                  <span className={cn("text-xs font-semibold mb-1", config.color)}>최종 검증 점수</span>
                                  <span className="text-2xl font-bold text-[#171A1F] leading-none">{score}<span className="text-sm font-medium text-[#737983] ml-0.5">점</span></span>
                                </div>
                                <div className={cn("text-sm font-bold px-3 py-1 rounded-full", config.bgColor, config.color, "mix-blend-multiply opacity-90")}>
                                  {config.label}
                                </div>
                              </div>
                            )
                          })()}
                        </>
                      )
                    })()}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-[#737983]">
                        <Clock size={13} />
                        {new Date(session.updated_at).toLocaleDateString()}
                      </div>
                      {session.status === 'completed' && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                          리포트 보기
                          <ArrowRight size={13} />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* 추가 검증 결제 버튼 */}
              <Link
                href="/api/checkout/new-session"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-bold px-6 py-4 rounded-2xl hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
              >
                <span>➕ 새로운 프랜차이즈 검증 추가</span>
                <span className="text-xs font-semibold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md ml-1">5,000원</span>
              </Link>

              {/* 리소스 배너 */}
              <Link
                href="/resources"
                className="mt-6 block bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#737983] mb-1">창업 리소스</p>
                    <h3 className="font-bold text-[#171A1F] group-hover:text-indigo-600 transition-colors">
                      필수 실사 사이트 모음
                    </h3>
                    <p className="text-sm text-[#737983] mt-0.5">공정위, 상권정보, 등기부등본 등 확인처 바로가기</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 ml-4">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
        
        {/* 오른쪽 사이드바 영역 */}
        <aside className="w-full md:w-[320px] shrink-0">
          <InsightSidebar />
        </aside>
      </main>
    </div>
  )
}
