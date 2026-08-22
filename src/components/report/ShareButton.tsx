'use client'

import { Share2 } from 'lucide-react'

export default function ShareButton({ shareUrl }: { shareUrl: string }) {
  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl)
      alert('링크가 복사되었습니다.')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-1 border-2 border-gray-200 text-gray-600 font-medium py-3.5 rounded-xl hover:border-gray-300 flex items-center justify-center gap-2 text-sm"
    >
      <Share2 size={16} />
      링크 복사
    </button>
  )
}
