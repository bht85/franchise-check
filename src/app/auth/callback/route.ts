import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 로그인 성공 후 메인 대시보드로 이동
  // Cloudflare Tunnel(fc-check.shop) 등 외부 도메인에서 접근했을 때 localhost로 튕기는 현상 방지
  const forwardedHost = request.headers.get('x-forwarded-host')
  const baseUrl = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin
  
  return NextResponse.redirect(`${baseUrl}/dashboard`)
}
