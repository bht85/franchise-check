'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewSessionPage() {
  const router = useRouter()
  const [step, setStep] = useState<'brand' | 'creating'>('brand')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    brand_name: '',
    hq_name: '',
    consultation_date: '',
    consultant_name: '',
  })

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreate = async () => {
    if (!form.brand_name.trim() || !form.hq_name.trim()) {
      setError('브랜드명과 본사명은 필수입니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? '세션 생성 실패')
      }

      router.push(`/session/${data.session.id}/survey`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 block"
        >
          ← 뒤로
        </button>
        <h1 className="text-2xl font-bold text-gray-900">검증할 브랜드 입력</h1>
        <p className="text-gray-500 text-sm mt-1">
          관심 있는 프랜차이즈 브랜드 정보를 입력하세요.
        </p>
      </div>

      {/* 폼 */}
      <div className="space-y-5">
        {/* 브랜드명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            브랜드명 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="예: 치킨시대"
              value={form.brand_name}
              onChange={(e) => handleChange('brand_name', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* 본사명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            본사(가맹본부) 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="예: (주)치킨시대"
            value={form.hq_name}
            onChange={(e) => handleChange('hq_name', e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* 상담일 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            본사 상담일
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={form.consultation_date}
              onChange={(e) => handleChange('consultation_date', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* 담당자 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            상담 담당자 이름
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="예: 홍길동 과장"
              value={form.consultant_name}
              onChange={(e) => handleChange('consultant_name', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* 오류 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 확인사항 */}
        <div className="bg-blue-50 rounded-xl px-4 py-4 text-sm text-blue-700">
          <p className="font-semibold mb-2">시작하기 전 확인</p>
          <ul className="space-y-1 text-blue-600">
            <li>• 총 약 50~60개 질문이 있습니다.</li>
            <li>• 모르면 "모름"을 선택하면 됩니다.</li>
            <li>• 중간에 나가도 다시 이어서 할 수 있습니다.</li>
            <li>• 마지막에 PDF 리포트를 받을 수 있습니다.</li>
          </ul>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleCreate}
          disabled={isLoading || !form.brand_name.trim() || !form.hq_name.trim()}
          className={cn(
            'w-full font-semibold py-4 rounded-xl transition-colors text-base flex items-center justify-center gap-2',
            isLoading || !form.brand_name.trim() || !form.hq_name.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isLoading ? (
            <span>세션 만드는 중...</span>
          ) : (
            <>
              확인 시작하기
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
