import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import NewSessionClient from '@/components/session/NewSessionClient'
import { cookies } from 'next/headers'

export default async function NewSessionPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 기존 세션 갯수 확인
  const { count } = await supabase
    .from('brand_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const cookieStore = await cookies()
  const hasPaid = cookieStore.get('paid_for_new_session')?.value === 'true'

  // 1개 이상 보유 중인데 추가 결제(쿠키)가 없으면 튕겨냄
  if (count && count >= 1 && !hasPaid) {
    redirect('/dashboard')
  }

  return <NewSessionClient />
}
