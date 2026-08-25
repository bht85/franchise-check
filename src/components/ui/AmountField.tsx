'use client'

import { cn } from '@/lib/utils'

interface AmountFieldProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  unit?: string
}

export function AmountField({ value, onChange, placeholder = '0', unit = '원' }: AmountFieldProps) {
  const formatted = value ? Number(value.replace(/[^0-9]/g, '')).toLocaleString() : ''

  return (
    <div className="flex items-baseline gap-4 border-b-2 border-[#E5E7EB] focus-within:border-indigo-500 transition-colors pb-3">
      <input
        type="text"
        inputMode="numeric"
        className="flex-1 text-3xl font-bold text-right text-[#171A1F] bg-transparent border-0 outline-none placeholder:text-[#E5E7EB]"
        placeholder={placeholder}
        value={formatted}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '')
          onChange(raw)
        }}
      />
      <span className="text-xl text-[#737983] font-medium shrink-0">{unit}</span>
    </div>
  )
}
