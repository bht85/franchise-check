import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import DocumentUploadClient from '@/components/documents/DocumentUploadClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function UploadPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  const { sessionId } = await params

  const { data: session } = await supabase
    .from('brand_sessions')
    .select('id, user_id, status, is_premium, brand:brands(brand_name)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!session) redirect('/dashboard')

  if (!session.is_premium) {
    redirect(`/session/${sessionId}/report`)
  }

  return <DocumentUploadClient sessionId={sessionId} />
}
