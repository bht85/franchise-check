import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // 실제 프로덕션에서는 Toss Payments 결제 완료 후 리다이렉트되는 곳입니다.
  // 현재는 가상으로 결제를 승인하고 쿠키를 발급합니다.
  
  const cookieStore = await cookies()
  // 30분 동안 유효한 결제 증명 쿠키 발급
  cookieStore.set('paid_for_new_session', 'true', { maxAge: 60 * 30, path: '/' })
  
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const baseUrl = `${protocol}://${host}`

  // 결제 완료 후 폼으로 이동
  return NextResponse.redirect(new URL('/session/new', baseUrl))
}
