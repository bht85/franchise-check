'use client'

import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
}

export default function NewsListClient({ news }: { news: NewsItem[] }) {
  const handleOpenPopup = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    // Prevent the default link behavior (opening in the same or new tab normally)
    e.preventDefault()
    
    const width = 800
    const height = 900
    // Center the popup window on the screen
    const left = typeof window !== 'undefined' ? (window.screen.width - width) / 2 : 0
    const top = typeof window !== 'undefined' ? (window.screen.height - height) / 2 : 0
    
    window.open(
      url, 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no`
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {news.map((item, idx) => (
        <a
          key={idx}
          href={item.link}
          onClick={(e) => handleOpenPopup(e, item.link)}
          className="group block p-3 -mx-3 rounded-xl hover:bg-[#F6F7F9] transition-colors cursor-pointer"
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
        </a>
      ))}
    </div>
  )
}
