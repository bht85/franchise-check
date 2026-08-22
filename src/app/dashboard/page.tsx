import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ArrowRight, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { cn, TEST_USER_ID } from '@/lib/utils'
import type { BrandSession, Brand } from '@/types'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { data: sessions } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  const typedSessions = (sessions ?? []) as (BrandSession & { brand: Brand })[]

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">내 검증 목록</h1>
          <Link
            href="/session/new"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} />새 검증
          </Link>
        </div>
      </header>

      <main className="px-4 py-6">
        {typedSessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <h2 className="text-gray-900 font-semibold mb-2">진행 중인 검증이 없습니다</h2>
            <p className="text-gray-500 text-sm mb-6">
              첫 번째 프랜차이즈 브랜드를 검증해보세요.
            </p>
            <Link
              href="/session/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              새 검증 시작하기
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {typedSessions.map((session) => (
              <Link
                key={session.id}
                href={
                  session.status === 'completed'
                    ? `/session/${session.id}/report`
                    : `/session/${session.id}/survey`
                }
                className="block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {session.brand.brand_name}
                    </h3>
                    <p className="text-sm text-gray-500">{session.brand.hq_name}</p>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {session.status === 'completed' ? '완료됨' : '진행 중'}
                  </span>
                </div>

                {session.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>진행률</span>
                      <span>{session.completion_pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${session.completion_pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(session.updated_at).toLocaleDateString()}
                  </div>
                  {session.status === 'completed' && (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle2 size={14} />
                      리포트 보기
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* 필수 사이트 모음 배너 */}
        <div className="mt-8">
          <Link
            href="/resources"
            className="block bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                🔍 창업 필수 실사 사이트 모음
              </h3>
              <p className="text-sm text-gray-600">
                공정위, 상권정보, 등기부등본 등 확인처 바로가기
              </p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <ArrowRight size={20} />
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
