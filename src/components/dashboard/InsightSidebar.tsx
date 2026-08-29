import { XMLParser } from 'fast-xml-parser'
import { Newspaper, ExternalLink } from 'lucide-react'
import NewsListClient from './NewsListClient'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
}

function getCleanTitle(title: string): string {
  const lastDashIndex = title.lastIndexOf(' - ')
  return lastDashIndex > -1 ? title.substring(0, lastDashIndex).trim() : title.trim()
}

function isDuplicate(title: string, existingTitles: string[]): boolean {
  const cleanTitle = getCleanTitle(title)
  
  for (const existing of existingTitles) {
    const cleanExisting = getCleanTitle(existing)
    
    // 1. 완전히 같은 제목인 경우
    if (cleanTitle === cleanExisting) return true
    
    // 2. 단어 유사도 검사 (핵심 단어 70% 이상 겹치면 중복 처리)
    const words1 = cleanTitle.split(/\s+/).filter(w => w.length > 1)
    const words2 = cleanExisting.split(/\s+/).filter(w => w.length > 1)
    
    let matchCount = 0
    for (const w of words1) {
      if (words2.includes(w)) matchCount++
    }
    
    const minLength = Math.min(words1.length, words2.length)
    if (minLength > 3 && matchCount / minLength >= 0.7) {
      return true
    }
  }
  return false
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
    
    const result: NewsItem[] = []
    const existingTitles: string[] = []

    for (const item of items) {
      if (result.length >= 3) break // 3개 찰 때까지 반복
      
      const title = item.title || ''
      if (!isDuplicate(title, existingTitles)) {
        existingTitles.push(title)
        result.push({
          title,
          link: item.link,
          pubDate: item.pubDate,
          source: item.source || 'Google 뉴스',
        })
      }
    }
    return result
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
        <NewsListClient news={news} />
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
