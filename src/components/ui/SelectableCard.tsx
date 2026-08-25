'use client'

import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectableCardProps {
  option_key: string
  option_text: string
  selected: boolean
  onClick: () => void
}

export function SelectableCard({ option_text, selected, onClick }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-center justify-between gap-4',
        'border-2 rounded-2xl px-6 py-4 transition-all duration-150',
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
          : 'border-[#E5E7EB] bg-white hover:border-indigo-300 hover:bg-gray-50'
      )}
    >
      <span className={cn(
        'text-base font-medium leading-snug',
        selected ? 'text-indigo-700' : 'text-[#171A1F]'
      )}>
        {option_text}
      </span>
      {selected && (
        <CheckCircle2 size={20} className="text-indigo-500 shrink-0" />
      )}
    </button>
  )
}
