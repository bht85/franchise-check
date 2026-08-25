import { XMLParser } from 'fast-xml-parser'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Newspaper, ExternalLink } from 'lucide-react'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
}

async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      'https://news.google.com/rss/search?q=%ED%94%84%EB%9E%9C%EC%B0%A8%EC%9D%B4%EC%A6%88+%EC%B0%BD%EC%97%85&hl=ko&gl=KR&ceid=KR:ko',
      { next: { revalidate: 3600 } } // 1시간마다 최신화
    )
    if (!res.ok) return []
    const xml = await res.text()
    
    const parser = new XMLParser()
    const jObj = parser.parse(xml)
    const items = jObj?.rss?.channel?.item || []
    
    // 최대 4개 가져오기
    return items.slice(0, 4).map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.source || 'Google 뉴스',
    }))
  } catch (error) {
    console.error('Failed to fetch news:', error)
    return []
  }
}

export default async function InsightSidebar() {
  const news = await getLatestNews()

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="text-indigo-600" size={20} />
        <h3 className="font-bold text-[#171A1F] text-lg">프랜차이즈 인사이트</h3>
      </div>
      <p className="text-sm text-[#737983] mb-5">
        성공적인 창업을 위한 최신 트렌드와 뉴스를 확인하세요.
      </p>

      {news.length === 0 ? (
        <div className="text-sm text-[#737983] py-4 text-center bg-gray-50 rounded-xl">
          새로운 소식을 불러올 수 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 -mx-3 rounded-xl hover:bg-[#F6F7F9] transition-colors"
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
      )}
      
      <a 
        href="https://news.google.com/search?q=%ED%94%84%EB%9E%9C%EC%B0%A8%EC%9D%B4%EC%A6%88+%EC%B0%BD%EC%97%85&hl=ko&gl=KR&ceid=KR:ko" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 bg-gray-50 text-sm font-medium text-[#737983] rounded-xl hover:bg-gray-100 transition-colors"
      >
        더 많은 뉴스 보기 <ExternalLink size={14} />
      </a>
    </div>
  )
}
