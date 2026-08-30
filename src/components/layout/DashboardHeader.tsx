'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, UserCircle, LogOut } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface DashboardHeaderProps {
  sessionCount?: number
  isPremium?: boolean
}

export default function DashboardHeader({ sessionCount = 0, isPremium = false }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const url = user.user_metadata?.avatar_url || user.user_metadata?.picture
        if (url) setAvatarUrl(url)
      }
    })
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 기본 무료 1개로 제한
  const isLimitReached = sessionCount >= 1

  const handleNewSessionClick = (e: React.MouseEvent) => {
    if (isLimitReached) {
      e.preventDefault()
      setShowPaymentModal(true)
    }
  }

  return (
    <>
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="FC Check 로고" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              가맹검증
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link
              href="/session/new"
              onClick={handleNewSessionClick}
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} />새 검증
            </Link>
            <Link
              href="/profile"
              className="w-9 h-9 bg-[#F6F7F9] rounded-xl flex items-center justify-center text-[#737983] hover:text-indigo-600 hover:bg-indigo-50 transition-colors overflow-hidden"
              title="내 정보"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={20} />
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="w-9 h-9 bg-[#F6F7F9] rounded-xl flex items-center justify-center text-[#737983] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 결제 팝업 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#171A1F] mb-2">새로운 검증 추가</h3>
            <p className="text-sm text-[#737983] mb-6 leading-relaxed">
              무료 검증은 1개까지만 제공됩니다. 새로운 프랜차이즈를 추가로 검증하시려면 <strong className="text-indigo-600">5,000원</strong>의 비용이 발생합니다.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/api/checkout/new-session')}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                5,000원 결제하고 추가하기
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3.5 bg-gray-100 text-[#737983] font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
