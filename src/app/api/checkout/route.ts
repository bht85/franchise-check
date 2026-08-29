import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  
  // 가상 결제 완료 처리
  await supabase
    .from('brand_sessions')
    .update({ 
      is_premium: true,
      status: 'premium_uploading'
    })
    .eq('id', sessionId)

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const baseUrl = `${protocol}://${host}`
  
  // 결제 완료 후 문서 업로드 화면으로 이동
  return NextResponse.redirect(new URL(`/session/${sessionId}/upload`, baseUrl))
}
