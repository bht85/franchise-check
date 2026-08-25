'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { X } from 'lucide-react'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
}

export default function NewsListClient({ news }: { news: NewsItem[] }) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  return (
    <>
      <div className="flex flex-col gap-4">
        {news.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedUrl(item.link)}
            className="group block p-3 -mx-3 rounded-xl hover:bg-[#F6F7F9] transition-colors cursor-pointer text-left w-full"
          >
            <h4 className="text-sm font-semibold text-[#171A1F] leading-snug mb-1.5 group-hover:text-indigo-600 line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-[#9095A0]">
              <span>{item.source}</span>
              <span>
                {formatDistanceToNow(new Date(item.pubDate), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white shrink-0">
              <h3 className="font-bold text-[#171A1F]">프랜차이즈 뉴스</h3>
              <button 
                onClick={() => setSelectedUrl(null)}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-[#737983]" />
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-50 relative">
              {/* Some sites may block iframe embedding via X-Frame-Options */}
              <iframe 
                src={selectedUrl} 
                className="absolute inset-0 w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
