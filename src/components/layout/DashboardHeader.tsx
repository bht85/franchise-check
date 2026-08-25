'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, UserCircle, LogOut, Lock } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface DashboardHeaderProps {
  sessionCount?: number
  isPremium?: boolean
}

export default function DashboardHeader({ sessionCount = 0, isPremium = false }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isLimitReached = !isPremium && sessionCount >= 3

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-lg font-bold text-[#171A1F]">
          가맹검증
        </Link>
        <div className="flex items-center gap-2">
          {isLimitReached ? (
            <Link
              href="/pricing"
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white bg-indigo-300 hover:bg-indigo-400 transition-colors px-4 py-2 rounded-xl"
            >
              <Lock size={14} />제한됨 (3/3)
            </Link>
          ) : (
            <Link
              href="/session/new"
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} />새 검증
            </Link>
          )}
          <Link
            href="/profile"
            className="w-9 h-9 bg-[#F6F7F9] rounded-xl flex items-center justify-center text-[#737983] hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="내 정보"
          >
            <UserCircle size={20} />
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
  )
}
