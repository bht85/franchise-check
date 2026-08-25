import Link from 'next/link'
import { ArrowRight, Shield, FileSearch, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171A1F] text-lg">가맹검증</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">베타</span>
          </div>
          <Link href="/login" className="text-sm text-[#737983] hover:text-[#171A1F] transition-colors">
            로그인
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#F6F7F9] border border-[#E5E7EB] text-[#737983] rounded-full px-4 py-2 text-sm mb-10">
          <Shield size={14} />
          프랜차이즈 계약 전 체크업 서비스
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-[#171A1F] leading-tight mb-6 tracking-tight">
          계약하기 전에,
          <br />
          <span className="text-indigo-600">한 번만 더 확인하세요.</span>
        </h1>

        <p className="text-xl text-[#737983] mb-10 max-w-xl mx-auto leading-relaxed">
          본사가 말한 것과 실제 확인한 것을 비교합니다.
          <br />
          미확인 항목과 의심 포인트를 정리해드립니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/session/new"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition-colors"
          >
            가맹계약 체크 시작하기
            <ArrowRight size={20} />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center bg-[#F6F7F9] text-[#737983] px-8 py-4 rounded-2xl font-medium text-lg hover:bg-[#E5E7EB] transition-colors"
          >
            서비스 소개 보기
          </Link>
        </div>

        <p className="text-xs text-[#737983] mt-6">
          법률 자문이 아닙니다. 입력된 정보 기준으로만 분석합니다.
        </p>
      </section>

      {/* 이 서비스가 하는 것 */}
      <section className="bg-[#F6F7F9] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-[#737983] uppercase tracking-wider mb-12 text-center">
            이 서비스가 하는 것
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileSearch size={24} className="text-indigo-600" />,
                title: '질문 하나씩, 쉬운 말로',
                desc: '어려운 법률 문서를 공부하지 않아도 됩니다. 질문에 답하는 것만으로 무엇을 확인했고 무엇이 빠졌는지 파악합니다.',
              },
              {
                icon: <AlertTriangle size={24} className="text-amber-500" />,
                title: '정보 불일치 자동 감지',
                desc: '본사 설명과 정보공개서 수치가 다르면 즉시 알려줍니다. "허위다"가 아닌 "차이가 있으니 확인하세요"로 표현합니다.',
              },
              {
                icon: <CheckCircle2 size={24} className="text-green-500" />,
                title: '본사에 물어볼 질문 자동 생성',
                desc: '미확인 항목과 불일치 내용을 바탕으로, 본사에 다시 확인해야 할 질문을 자동으로 만들어 줍니다.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <p className="font-semibold text-[#171A1F] text-lg mb-3">{item.title}</p>
                <p className="text-[#737983] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이 서비스가 하지 않는 것 */}
      <section className="py-14 px-6">
        <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-100 rounded-3xl p-8">
          <p className="text-amber-800 font-semibold mb-3">이 서비스가 하지 않는 것</p>
          <ul className="text-amber-700 text-sm space-y-2">
            <li>✗ "이 프랜차이즈는 좋은 브랜드입니다" 같은 추천</li>
            <li>✗ 법적 자문 또는 위법 판단</li>
            <li>✗ 본사 광고나 브랜드 홍보</li>
            <li>✗ 없는 정보를 AI가 만들어내는 것</li>
          </ul>
        </div>
      </section>

      {/* 어떻게 진행되나요 */}
      <section id="how-it-works" className="bg-[#F6F7F9] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#171A1F] mb-14 text-center">어떻게 진행되나요?</h2>
          <div className="max-w-lg mx-auto space-y-0">
            {[
              { step: 1, label: '나의 창업 상황', desc: '자기자본, 대출 계획, 운영 방식' },
              { step: 2, label: '관심 프랜차이즈', desc: '브랜드명, 상담일, 담당자' },
              { step: 3, label: '본사에서 들은 이야기', desc: '상담에서 받은 설명 기록' },
              { step: 4, label: '투자금 / 비용 확인', desc: '가맹비, 인테리어, 운영자금' },
              { step: 5, label: '매출 / 수익 확인', desc: '평균 매출, 산정 기준, 산정서' },
              { step: 6, label: '계약조건 확인', desc: '기간, 해지, 영업지역, 로열티' },
              { step: 7, label: '실제 점주 확인', desc: '점주와 대화한 내용 기록' },
              { step: 8, label: '문서 업로드', desc: '정보공개서, 계약서 PDF' },
              { step: 9, label: '최종 리포트', desc: '미확인 항목, 불일치, 본사 질문' },
            ].map((item, idx, arr) => (
              <div key={item.step} className="flex gap-5 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {item.step}
                  </div>
                  {idx < arr.length - 1 && <div className="w-px h-10 bg-indigo-100 my-1" />}
                </div>
                <div className="pb-6">
                  <span className="font-semibold text-[#171A1F] text-sm">{item.label}</span>
                  <span className="text-[#737983] text-sm ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-[#171A1F] py-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-3">
            이 브랜드가 좋은지 판단하기 전에,
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            내가 충분히 확인했는지부터 확인하세요.
          </p>
          <Link
            href="/session/new"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-500 transition-colors"
          >
            지금 시작하기 — 무료
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[#E5E7EB] py-8 px-6 text-center">
        <p className="text-xs text-[#737983]">
          가맹검증은 법률 자문 서비스가 아닙니다. 모든 분석은 사용자가 입력한 정보 기준입니다.
          <br />
          계약 전 전문가(가맹거래사, 변호사)의 검토를 권장합니다.
        </p>
      </footer>
    </div>
  )
}
