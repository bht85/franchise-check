import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import NewSessionClient from '@/components/session/NewSessionClient'

export default async function NewSessionPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인이 안 되어 있으면 로그인 페이지로 강제 이동
  if (!user) {
    redirect('/login')
  }

  return <NewSessionClient />
}
