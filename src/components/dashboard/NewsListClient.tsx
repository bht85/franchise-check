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
  return (
    <div className="flex flex-col gap-4">
      {news.map((item, idx) => (
        <a
          key={idx}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
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
