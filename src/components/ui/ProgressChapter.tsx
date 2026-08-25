import Link from 'next/link'
import { X } from 'lucide-react'

interface ProgressChapterProps {
  current: number
  total: number
  percentage: number
  stepLabel: string
}

export function ProgressChapter({ current, total, percentage, stepLabel }: ProgressChapterProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-[#E5E7EB] z-50">
      <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between relative">
        <Link 
          href="/dashboard"
          className="text-[#737983] hover:text-[#171A1F] transition-colors p-1 -ml-1 rounded-md hover:bg-gray-100 flex items-center gap-1.5"
          title="저장하고 대시보드로 나가기"
        >
          <X size={18} />
        </Link>
        
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full absolute left-1/2 -translate-x-1/2">
          {stepLabel}
        </span>
        
        <span className="text-xs font-medium text-[#737983]">
          {current} / {total}
        </span>
      </div>
      <div className="h-0.5 bg-[#E5E7EB]">
        <div
          className="h-0.5 bg-indigo-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
