'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

interface ProfileClientProps {
  initialPreferences: Record<string, any>
  userId: string
}

export default function ProfileClient({ initialPreferences, userId }: ProfileClientProps) {
  const router = useRouter()
  const [preferences, setPreferences] = useState<Record<string, string>>(initialPreferences)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      })
      if (!res.ok) throw new Error('저장 실패')
      setMessage('성공적으로 저장되었습니다.')
      router.refresh()
    } catch (err) {
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <p className="text-sm text-gray-500 mb-4">
          여기에 정보를 미리 입력해두면, 새로운 프랜차이즈를 검증할 때 자동으로 답변이 채워집니다.
        </p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            보유 자금 (원)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="예: 50,000,000"
            value={preferences.own_capital ? Number(preferences.own_capital).toLocaleString() : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              handleChange('own_capital', raw)
            }}
            className="w-full text-right border-2 border-[#E5E7EB] rounded-xl px-4 py-3 font-semibold text-[#171A1F] focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            대출 이용 여부
          </label>
          <select
            value={preferences.use_loan || ''}
            onChange={(e) => handleChange('use_loan', e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white"
          >
            <option value="">선택 안함</option>
            <option value="true">대출 이용할 예정임</option>
            <option value="false">대출 없이 진행함</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            월 대출 상환 가능액 (원)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="예: 1,000,000"
            value={preferences.monthly_loan_payment ? Number(preferences.monthly_loan_payment).toLocaleString() : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              handleChange('monthly_loan_payment', raw)
            }}
            className="w-full text-right border-2 border-[#E5E7EB] rounded-xl px-4 py-3 font-semibold text-[#171A1F] focus:border-indigo-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            disabled={preferences.use_loan === 'false'}
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('성공') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full font-semibold py-4 rounded-xl transition-colors text-base flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
      >
        <Save size={18} />
        {isSaving ? '저장 중...' : '내 정보 저장하기'}
      </button>
    </div>
  )
}
