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

  // 임시 만료일 계산 (현재 + 7일)
  const expiryDateObj = new Date()
  expiryDateObj.setDate(expiryDateObj.getDate() + 7)
  const formattedExpiryDate = `${expiryDateObj.getFullYear()}년 ${expiryDateObj.getMonth() + 1}월 ${expiryDateObj.getDate()}일 23:59`

  return <DocumentUploadClient sessionId={sessionId} expiryDate={formattedExpiryDate} />
}
