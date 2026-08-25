'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewSessionClient() {
  const router = useRouter()
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

  const fieldClass = 'w-full bg-transparent border-0 border-b-2 border-[#E5E7EB] focus:border-indigo-500 focus:outline-none text-xl font-semibold text-[#171A1F] py-3 transition-colors placeholder:text-[#E5E7EB]'
  const labelClass = 'block text-xs font-semibold text-[#737983] uppercase tracking-wider mb-3'

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col">
      {/* 상단 바 */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="text-sm text-[#737983] hover:text-[#171A1F] transition-colors">
            ← 뒤로
          </button>
          <span className="font-semibold text-[#171A1F]">가맹검증</span>
          <div className="w-10" />
        </div>
      </div>

      {/* 메인 */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-[#171A1F] mb-2">
            어떤 프랜차이즈를 계약 검토 중이신가요?
          </h1>
          <p className="text-[#737983] mb-10">
            브랜드 이름과 본사 정보만 입력하면 바로 시작할 수 있습니다.
          </p>

          <div className="space-y-8">
            {/* 브랜드명 */}
            <div>
              <label className={labelClass}>브랜드 이름 <span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="예: 치킨시대"
                value={form.brand_name}
                onChange={(e) => handleChange('brand_name', e.target.value)}
                className={fieldClass}
                autoFocus
              />
            </div>

            {/* 본사명 */}
            <div>
              <label className={labelClass}>본사(가맹본부) 이름 <span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="예: (주)치킨시대"
                value={form.hq_name}
                onChange={(e) => handleChange('hq_name', e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* 상담일 */}
            <div>
              <label className={labelClass}>본사 상담일</label>
              <input
                type="date"
                value={form.consultation_date}
                onChange={(e) => handleChange('consultation_date', e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* 담당자 */}
            <div>
              <label className={labelClass}>상담 담당자</label>
              <input
                type="text"
                placeholder="예: 홍길동 과장"
                value={form.consultant_name}
                onChange={(e) => handleChange('consultant_name', e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* 참고사항 박스 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <p className="text-sm font-semibold text-[#171A1F] mb-3">시작 전 참고사항</p>
              <ul className="text-sm text-[#737983] space-y-2">
                <li>• 총 약 50~60개 항목입니다.</li>
                <li>• 모르는 항목은 &apos;모름&apos;을 선택하면 됩니다.</li>
                <li>• 중간에 나가도 이어서 할 수 있습니다.</li>
                <li>• 마지막에 PDF 리포트를 받을 수 있습니다.</li>
              </ul>
            </div>

            {/* 오류 */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 시작 버튼 */}
            <button
              onClick={handleCreate}
              disabled={isLoading || !form.brand_name.trim() || !form.hq_name.trim()}
              className={cn(
                'w-full font-semibold py-4 rounded-2xl transition-colors text-lg flex items-center justify-center gap-2',
                isLoading || !form.brand_name.trim() || !form.hq_name.trim()
                  ? 'bg-[#E5E7EB] text-[#737983] cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              )}
            >
              {isLoading ? '만드는 중...' : (
                <>체크 시작하기 <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
