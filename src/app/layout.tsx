import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '가맹검증 — 프랜차이즈 계약 전 실사 플랫폼',
  description:
    '계약서에 사인하기 전에, 본사가 말한 것부터 하나씩 확인하세요. 어려운 프랜차이즈 정보를 한 질문씩 쉽게 확인합니다.',
  openGraph: {
    title: '가맹검증',
    description: '프랜차이즈 계약 전, 딱 이것만 확인하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
