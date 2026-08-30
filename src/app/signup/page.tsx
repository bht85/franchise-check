import { redirect } from 'next/navigation'

export default function SignupPage() {
  // 카카오 단일 로그인으로 통합되었으므로 /login으로 자동 리다이렉트
  redirect('/login')
}
