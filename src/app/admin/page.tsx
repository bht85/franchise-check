export const dynamic = "force-dynamic"

import { redirect } from 'next/navigation'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { Activity, Users, FileText, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. 관리자 권한 확인 (환경변수에 쉼표로 구분된 이메일 목록)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const userEmail = user.email?.toLowerCase() || ''

  if (!adminEmails.includes(userEmail)) {
    console.warn(`[Admin] Unauthorized access attempt by ${userEmail}`)
    redirect('/dashboard') // 권한이 없으면 일반 대시보드로 강제 이동
  }

  // 2. 어드민 클라이언트로 전체 데이터 조회 (RLS 무시)
  const adminDb = createSupabaseAdminClient()

  // 2-1. 전체 세션(분석 리포트) 수
  const { count: totalSessions } = await adminDb
    .from('brand_sessions')
    .select('*', { count: 'exact', head: true })

  // 2-2. 오늘 생성된 세션 수
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todaySessions } = await adminDb
    .from('brand_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // 2-3. 가장 많이 조회된 브랜드 TOP 5
  // (brand_sessions를 brand_id로 group by해야 하지만 Supabase JS로는 바로 안되므로 전체를 가져와서 집계)
  const { data: allSessions } = await adminDb
    .from('brand_sessions')
    .select('brand_id, brand:brands(brand_name)')
    .order('created_at', { ascending: false })
    .limit(1000) // 최근 1000개만 분석

  const brandCounts: Record<string, { name: string, count: number }> = {}
  if (allSessions) {
    allSessions.forEach(s => {
      if (!s.brand_id || !s.brand) return
      if (!brandCounts[s.brand_id]) {
        brandCounts[s.brand_id] = { name: (s.brand as any).brand_name, count: 0 }
      }
      brandCounts[s.brand_id].count++
    })
  }
  
  const topBrands = Object.values(brandCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 2-4. 최근 생성된 세션 10개 목록
  const { data: recentSessions } = await adminDb
    .from('brand_sessions')
    .select('id, created_at, user_id, is_completed, score, brand:brands(brand_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드 요약</h2>
        <p className="text-gray-500 mt-1">시스템의 전체 현황을 모니터링합니다.</p>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">총 검증 세션</p>
            <p className="text-2xl font-bold text-gray-900">{totalSessions || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">오늘 생성된 세션</p>
            <p className="text-2xl font-bold text-gray-900">{todaySessions || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 최근 세션 목록 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              최근 생성된 검증 리포트
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">브랜드명</th>
                  <th className="px-4 py-3">생성 일시</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3 rounded-r-lg">점수</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions?.map(session => (
                  <tr key={session.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {(session.brand as any)?.brand_name || '알 수 없음'}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(session.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-4">
                      {session.is_completed ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">완료</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">진행중</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-500 font-medium">
                      {session.score !== null ? `${session.score}점` : '-'}
                    </td>
                  </tr>
                ))}
                {(!recentSessions || recentSessions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 최다 조회 브랜드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-indigo-500" />
            인기 검증 브랜드 TOP 5
          </h3>
          <ul className="space-y-4">
            {topBrands.map((b, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full text-xs">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-900">{b.name}</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{b.count}건</span>
              </li>
            ))}
            {topBrands.length === 0 && (
              <li className="text-center text-gray-500 py-4 text-sm">데이터가 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
