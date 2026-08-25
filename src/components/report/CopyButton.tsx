'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium text-[#737983] hover:text-indigo-600 border border-[#E5E7EB] hover:border-indigo-300 px-3 py-1.5 rounded-full transition-all"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? '복사됨' : '복사'}
    </button>
  )
}
