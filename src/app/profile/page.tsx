export const runtime = 'edge'
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
    .select('is_premium')
    .eq('user_id', user.id)
    
  const sessionCount = sessions?.length || 0
  const isPremium = sessions?.some(s => s.is_premium) || false

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <DashboardHeader sessionCount={sessionCount} isPremium={isPremium} />
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <h2 className="text-xl font-bold text-[#171A1F] mb-6">내 정보 관리</h2>
        
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] mb-8">
          <h3 className="text-sm font-semibold text-[#737983] mb-4">계정 정보</h3>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5E7EB]">
            <span className="text-sm text-[#737983]">로그인 계정</span>
            <span className="font-semibold text-[#171A1F]">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#737983]">이용 플랜</span>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                ✨ 프리미엄 혜택 보기
              </Link>
              {isPremium ? (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">프리미엄 요금제</span>
              ) : (
                <span className="text-xs font-bold text-[#737983] bg-gray-100 px-3 py-1.5 rounded-full">무료 요금제 (최대 3개)</span>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[#737983] mb-4">검증 기본 설정</h3>
        <ProfileClient initialPreferences={profile?.preferences || {}} userId={user.id} />
      </main>
    </div>
  )
}
