import { redirect } from "next/navigation"
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import DashboardHeader from '@/components/layout/DashboardHeader'
import ProfileClient from '@/components/profile/ProfileClient'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('user_id', user.id)
    .single()

  const { data: sessions } = await supabase
    .from('brand_sessions')
    .select('id, is_premium')
    .eq('user_id', user.id)
    
  const sessionCount = sessions?.length || 0
  const isPremium = sessions?.some(s => s.is_premium) || false

  // 카카오 메타데이터 추출
  const isKakao = user.app_metadata?.provider === 'kakao' || user.identities?.some(id => id.provider === 'kakao')
  const name = user.user_metadata?.full_name || user.user_metadata?.name || '카카오 사용자'
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const basicRemaining = Math.max(1 - sessionCount, 0) // 기본 1회 무료에서 사용한 만큼 차감

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <DashboardHeader sessionCount={sessionCount} isPremium={isPremium} />
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <h2 className="text-xl font-bold text-[#171A1F] mb-6">내 정보 관리</h2>
        
        {/* 계정 프로필 영역 */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E5E7EB]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="프로필" className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold shadow-sm shrink-0">
                {name.charAt(0)}
              </div>
            )}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-[#171A1F]">{name}</h3>
                {isKakao && (
                  <div className="flex items-center justify-center w-5 h-5 bg-[#FEE500] rounded-full text-[#371d1e] shadow-sm" title="카카오 연동 계정">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.86 1.8 5.37 4.5 6.78l-1.16 4.34c-.1.38.3.7.64.5l4.13-2.76c.62.1 1.25.16 1.89.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-[#737983]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#171A1F]">보유 검증권 (이용 플랜)</h3>
            <Link href="/pricing" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
              자세히 보기 &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 기본 검증권 */}
            <div className="flex flex-col justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <div className="font-semibold text-gray-900 mb-1">기본 가맹검증</div>
                <div className="text-xs text-gray-500">최초 1회 무료 제공</div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-xs text-gray-500">추가 시 5,000원</div>
                <span className={`font-bold ${basicRemaining > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  잔여 {basicRemaining}회
                </span>
              </div>
            </div>
            
            {/* 프리미엄 검증권 */}
            <div className="flex flex-col justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div>
                <div className="font-semibold text-indigo-900 mb-1 flex items-center gap-1">
                  ✨ 프리미엄 분석
                </div>
                <div className="text-xs text-indigo-700/70">전문가 수준의 심층 리포트</div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-xs text-indigo-600 font-medium">1회 5,000원</div>
                {isPremium ? (
                  <span className="font-bold text-indigo-600">활성화됨</span>
                ) : (
                  <Link href="/pricing" className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors">
                    구매하기
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[#737983] mb-4">검증 기본 설정</h3>
        <ProfileClient initialPreferences={profile?.preferences || {}} userId={user.id} />
      </main>
    </div>
  )
}
