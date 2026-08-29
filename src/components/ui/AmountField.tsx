'use client'

import { cn } from '@/lib/utils'

interface AmountFieldProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  unit?: string
}

export function AmountField({ value, onChange, placeholder = '0', unit = '만원' }: AmountFieldProps) {
  // DB에 저장된 원 단위(예: 60000000)를 만원 단위(6000)로 변환해서 표시
  const rawValue = value ? Number(value.replace(/[^0-9]/g, '')) : 0
  const displayValue = rawValue > 0 ? String(Math.floor(rawValue / 10000)) : ''
  const formatted = displayValue ? Number(displayValue).toLocaleString() : ''

  return (
    <div className="flex items-baseline gap-4 border-b-2 border-[#E5E7EB] focus-within:border-indigo-500 transition-colors pb-3">
      <input
        type="text"
        inputMode="numeric"
        className="flex-1 text-3xl font-bold text-right text-[#171A1F] bg-transparent border-0 outline-none placeholder:text-[#E5E7EB]"
        placeholder={placeholder}
        value={formatted}
        onChange={(e) => {
          const inputRaw = e.target.value.replace(/[^0-9]/g, '')
          if (!inputRaw) {
            onChange('')
          } else {
            // 사용자가 입력한 만원 단위 숫자에 10,000을 곱해서 원 단위로 저장
            const calculated = Number(inputRaw) * 10000
            onChange(String(calculated))
          }
        }}
      />
      <span className="text-xl text-[#737983] font-medium shrink-0">{unit}</span>
    </div>
  )
}
