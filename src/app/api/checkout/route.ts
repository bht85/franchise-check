import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  
  // 가상 결제 완료 처리
  const { data, error } = await supabase
    .from('brand_sessions')
    .update({ 
      is_premium: true
    })
    .eq('id', sessionId)
    .select()

  if (error) {
    console.error('[checkout] Error updating session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
  
  if (!data || data.length === 0) {
    console.error('[checkout] Session not found or RLS blocked update for sessionId:', sessionId)
    return NextResponse.json({ error: 'Session not found or permission denied' }, { status: 403 })
  }

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const baseUrl = `${protocol}://${host}`
  
  // 결제 완료 후 문서 업로드 화면으로 이동
  return NextResponse.redirect(new URL(`/session/${sessionId}/upload`, baseUrl))
}
