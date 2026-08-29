'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState('test@test.com')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const testEmail = 'test@test.com'
      const testPassword = '123456'

      let { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        })
        if (signUpError) throw signUpError

        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })
        if (retryError) throw retryError
      } else if (signInError) {
        throw signInError
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : '테스트 계정 로그인 실패')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signInError) throw signInError
    } catch (err) {
      setError(err instanceof Error ? err.message : '구글 로그인에 실패했습니다.')
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
            본사가 말한 것과 실제 확인한 것을 비교합니다.
          </p>
        </div>
        <div>
          <p className="text-sm text-indigo-200 leading-relaxed italic">
            &ldquo;이 서비스를 쓰기 전까지는 본사가 하는 말을 그냥 믿었어요.&rdquo;
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
          <h2 className="text-2xl font-bold text-[#171A1F] mb-2">로그인</h2>
          <p className="text-[#737983] mb-8">이메일로 로그인하세요.</p>

          <form className="space-y-5" onSubmit={handleLogin}>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[#171A1F] focus:outline-none focus:border-indigo-500 transition-colors"
              />
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
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : '이메일로 로그인'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-[#737983]">또는</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-[#E5E7EB] bg-white py-3.5 rounded-xl text-sm font-medium text-[#171A1F] hover:bg-[#F6F7F9] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google로 로그인
          </button>

          <p className="mt-6 text-center text-sm text-[#737983]">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
