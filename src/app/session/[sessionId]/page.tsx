import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CategoryHubClient from '@/components/survey/CategoryHubClient'
import type { Question, QuestionAnswer } from '@/types'

interface Props {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ completed?: string, quick?: string }>
}

const HUB_STEPS = [1, 3, 4, 5, 6, 7]

async function getLatestNews(brandName: string) {
  if (!brandName) return []
  try {
    const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(brandName)}&hl=ko&gl=KR&ceid=KR:ko`, { 
      next: { revalidate: 3600 } 
    })
    const text = await res.text()
    
    const items: Array<{ title: string; link: string; date: string }> = []
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g
    
    let match
    const seenWords = new Set<string>()

    while ((match = itemRegex.exec(text)) !== null && items.length < 3) {
      const title = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/ - .*$/, '')
      const link = match[2]
      
      // 중복 기사 필터링 (단어 유사도 기반)
      const words = title.split(/\s+/).filter(w => w.length > 1)
      const overlap = words.filter(w => seenWords.has(w)).length
      if (words.length > 0 && (overlap / words.length) > 0.4) {
        continue // 유사한 제목 패스
      }
      words.forEach(w => seenWords.add(w))

      // 고정된 YYYY-MM-DD 포맷 (Hydration mismatch 방지)
      const d = new Date(match[3])
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      items.push({ title, link, date: dateStr })
    }
    return items
  } catch (e) {
    return []
  }
}

export default async function SessionHubPage({ params, searchParams }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params
  const { completed } = await searchParams

  // 세션 + 브랜드 소유권 확인
  const { data: session, error: sessionError } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (sessionError) {
    console.error('[SessionHub] session fetch error:', sessionError)
  }

  if (!session) {
    console.error('[SessionHub] session not found, redirecting. sessionId:', sessionId, 'userId:', userId)
    redirect('/dashboard')
  }

  const brand = session.brand as { brand_name: string; hq_name: string } | null

  // 허브 대상 step의 활성 질문만 로드
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*, options:question_options(*), conditions:question_conditions!question_id(*)')
    .eq('is_active', true)
    .in('step_number', HUB_STEPS)
    .order('step_number')
    .order('order_in_step')

  if (questionsError) {
    console.error('[SessionHub] questions fetch error:', questionsError)
  }

  // 이 세션의 기존 답변 로드
  const { data: answers, error: answersError } = await supabase
    .from('question_answers')
    .select('*')
    .eq('session_id', sessionId)

  if (answersError) {
    console.error('[SessionHub] answers fetch error:', answersError)
  }

  const justCompletedStep = completed ? parseInt(completed, 10) : null
  const latestNews = await getLatestNews(brand?.brand_name ?? '')

  // Quick Check 완료 여부 확인
  const typedQuestions = (questions ?? []) as Question[]
  const typedAnswers = (answers ?? []) as QuestionAnswer[]
  
  const quickCheckQuestions = typedQuestions.filter(q => q.is_quick_check)
  const isQuickCheckCompleted = quickCheckQuestions.length > 0 && quickCheckQuestions.every(q => {
    const a = typedAnswers.find(ans => ans.question_id === q.id)
    return a && a.answer_state !== 'not_checked'
  })

  // 'quick=done' 파라미터가 없고, Quick Check를 아직 다 안 풀었다면 Quick Check 화면으로 이동
  const { quick } = await searchParams
  if (!isQuickCheckCompleted && quick !== 'done') {
    redirect(`/session/${sessionId}/quick`)
  }

  return (
    <CategoryHubClient
      sessionId={sessionId}
      brandName={brand?.brand_name ?? ''}
      hqName={brand?.hq_name ?? ''}
      initialQuestions={typedQuestions}
      initialAnswers={typedAnswers}
      justCompletedStep={Number.isNaN(justCompletedStep) ? null : justCompletedStep}
      latestNews={latestNews}
      showTeaser={quick === 'done'}
    />
  )
}
