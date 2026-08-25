'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 border border-[#E5E7EB] text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-[#171A1F] mb-3">가입 확인 이메일 발송</h2>
          <p className="text-[#737983] text-sm mb-8 leading-relaxed">
            입력하신 이메일로 가입 확인 링크를 보냈습니다.
            이메일을 확인하고 인증을 완료해주세요.
          </p>
          <Link
            href="/login"
            className="block w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex">
      {/* 왼쪽 패널 (데스크탑 전용) */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 flex-col justify-between p-12 text-white">
        <div>
          <span className="font-bold text-xl">가맹검증</span>
          <h2 className="text-4xl font-black leading-tight mt-12 mb-6">
            이메일만으로<br />시작하세요.
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            무료로 프랜차이즈 계약을 검증하고<br />체계적인 리포트를 받아보세요.
          </p>
        </div>
        <div>
          <p className="text-sm text-indigo-200 leading-relaxed italic">
            &ldquo;계약서에 도장 찍기 전에 이걸 먼저 했더라면...&rdquo;
          </p>
          <p className="text-xs text-indigo-300 mt-2">— 실제 이용자 후기</p>
        </div>
      </div>

      {/* 오른쪽 폼 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="text-sm text-[#737983] hover:text-[#171A1F] transition-colors mb-8 block">
            ← 홈으로
          </Link>
          <h2 className="text-2xl font-bold text-[#171A1F] mb-2">회원가입</h2>
          <p className="text-[#737983] mb-8">이메일만으로 간단하게 시작하세요.</p>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-xs font-semibold text-[#737983] uppercase tracking-wider mb-2">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[#171A1F] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737983] uppercase tracking-wider mb-2">비밀번호</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[#171A1F] focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-[#737983] mt-1.5">6자 이상</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : '가입하기'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#737983]">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
