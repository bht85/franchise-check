import Link from 'next/link'
import { ArrowRight, Shield, FileSearch, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">가맹검증</span>
          <Link
            href="/login"
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            로그인
          </Link>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="px-4 pt-12 pb-10 max-w-lg mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium mb-6">
          <Shield size={12} />
          무료 서비스 · 광고 없음
        </div>

        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          프랜차이즈 계약 전에,
          <br />
          <span className="text-blue-600">딱 이것만 확인하세요.</span>
        </h1>

        <p className="text-gray-500 text-base leading-relaxed mb-8">
          본사가 말한 내용과 실제 확인한 내용을
          <br />
          하나씩 비교해 봅니다.
        </p>

        <Link
          href="/session/new"
          className="block w-full bg-blue-600 text-white text-base font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          무료로 내 창업 리스크 확인하기
          <ArrowRight className="inline ml-2 mb-0.5" size={18} />
        </Link>

        <Link
          href="#how-it-works"
          className="block w-full mt-3 bg-gray-50 text-gray-600 text-base font-medium py-4 rounded-xl hover:bg-gray-100 transition-colors"
        >
          어떤 서비스인가요?
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          이 서비스는 법률 자문이 아닙니다. 현재 입력된 정보 기준으로만 분석합니다.
        </p>
      </section>

      {/* 핵심 메시지 */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6 text-center">
            이 서비스가 하는 것
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <FileSearch className="text-blue-500 shrink-0" size={20} />,
                title: '질문 하나씩, 쉬운 말로',
                desc: '어려운 법률 문서를 공부하지 않아도 됩니다. 질문에 답하는 것만으로 무엇을 확인했고 무엇이 빠졌는지 파악합니다.',
              },
              {
                icon: <AlertTriangle className="text-orange-500 shrink-0" size={20} />,
                title: '불일치 자동 탐지',
                desc: '본사 설명과 정보공개서 수치가 다르면 즉시 알려줍니다. "허위다"가 아닌 "차이가 있으니 확인하세요"로 표현합니다.',
              },
              {
                icon: <CheckCircle2 className="text-green-500 shrink-0" size={20} />,
                title: '본사에 물어볼 질문 자동 생성',
                desc: '미확인 항목과 불일치 내용을 바탕으로, 본사에 다시 확인해야 할 질문을 자동으로 만들어 줍니다.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 bg-white rounded-xl p-4 shadow-sm">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 서비스 아님 명확화 */}
      <section className="px-4 py-10 max-w-lg mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 font-semibold text-sm mb-2">이 서비스가 하지 않는 것</p>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>✗ "이 프랜차이즈는 좋은 브랜드입니다" 같은 추천</li>
            <li>✗ 법적 자문 또는 위법 판단</li>
            <li>✗ 본사 광고나 브랜드 홍보</li>
            <li>✗ 없는 정보를 AI가 만들어내는 것</li>
          </ul>
        </div>
      </section>

      {/* 진행 구조 */}
      <section id="how-it-works" className="bg-gray-50 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="font-bold text-gray-900 text-xl mb-6 text-center">어떻게 진행되나요?</h2>
          <div className="space-y-3">
            {[
              { step: 1, label: '나의 창업 상황', desc: '자기자본, 대출 계획, 운영 방식' },
              { step: 2, label: '관심 프랜차이즈', desc: '브랜드명, 상담일, 담당자' },
              { step: 3, label: '본사에서 들은 이야기', desc: '상담에서 받은 설명 기록' },
              { step: 4, label: '투자금 / 비용 확인', desc: '가맹비, 인테리어, 운영자금' },
              { step: 5, label: '매출 / 수익 확인', desc: '평균 매출, 산정 기준, 산정서' },
              { step: 6, label: '계약조건 확인', desc: '기간, 해지, 영업지역, 로열티' },
              { step: 7, label: '실제 점주 확인', desc: '점주와 대화한 내용 기록' },
              { step: 8, label: '문서 업로드', desc: '정보공개서, 계약서 PDF' },
              { step: 12, label: '최종 리포트', desc: '미확인 항목, 불일치, 본사 질문' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                  <span className="text-gray-400 text-sm ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 최하단 CTA */}
      <section className="px-4 py-12 max-w-lg mx-auto text-center">
        <h2 className="font-bold text-gray-900 text-2xl mb-3">
          이 브랜드가 좋은지 판단하기 전에,
        </h2>
        <p className="text-gray-500 mb-8">
          내가 충분히 확인했는지부터 확인하세요.
        </p>
        <Link
          href="/session/new"
          className="block w-full bg-blue-600 text-white text-base font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          지금 시작하기 — 무료
          <ArrowRight className="inline ml-2 mb-0.5" size={18} />
        </Link>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 px-4 py-6 text-center">
        <p className="text-xs text-gray-400">
          가맹검증은 법률 자문 서비스가 아닙니다. 모든 분석은 사용자가 입력한 정보 기준입니다.
          <br />
          계약 전 전문가(가맹거래사, 변호사)의 검토를 권장합니다.
        </p>
      </footer>
    </div>
  )
}
