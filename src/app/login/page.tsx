'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex">
      {/* 왼쪽 패널 (데스크탑 전용) */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 flex-col justify-between p-12 text-white">
        <div>
          <span className="font-bold text-xl">가맹검증</span>
          <h2 className="text-4xl font-black leading-tight mt-12 mb-6">
            계약하기 전에,<br />한 번만 더<br />확인하세요.
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            프랜차이즈 본사가 말한 것과 실제 계약서 내용이 같은지<br />AI가 꼼꼼하게 대조해 드립니다.
          </p>
        </div>
        <div>
          <p className="text-sm text-indigo-200 leading-relaxed italic">
            "도장 찍기 전에 이걸 안 해봤다면 정말 큰일 날 뻔했습니다."
          </p>
          <p className="text-xs text-indigo-300 mt-2">— 실제 이용자 후기</p>
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-block text-sm text-[#737983] hover:text-[#171A1F] transition-colors mb-12">
            ← 메인 홈으로 돌아가기
          </Link>
          
          <div className="mb-10">
            <h2 className="text-3xl font-black text-[#171A1F] mb-3">환영합니다!</h2>
            <p className="text-[#737983] text-sm leading-relaxed">
              복잡한 비밀번호 입력 없이,<br />평소 쓰시던 카카오톡으로 3초 만에 시작하세요.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 mb-6 text-left">
              {error}
            </div>
          )}

          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FDD800] py-4 rounded-2xl text-[15px] font-semibold text-[#191919] transition-all transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-[#191919]" size={22} />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 3C6.477 3 2 6.551 2 10.93c0 2.825 1.776 5.304 4.47 6.671-.237.818-.847 3.018-.87 3.161-.03.18.067.177.142.127.059-.039 1.956-1.3 3.618-2.457 1.25.32 2.593.498 3.974.498 5.523 0 10-3.551 10-7.93S17.523 3 12 3z" />
                </svg>
                카카오로 3초 만에 시작하기
              </>
            )}
          </button>
          
          <p className="mt-8 text-xs text-gray-400">
            버튼을 누르시면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
