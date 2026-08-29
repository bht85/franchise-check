export const runtime = 'edge'
import Link from 'next/link'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { Check, ArrowRight, Zap, ShieldCheck } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-[#171A1F] tracking-tight mb-4">
            가장 안전한 창업을 위한 완벽한 준비
          </h1>
          <p className="text-lg text-[#737983] max-w-2xl mx-auto">
            원하는 브랜드의 검증 깊이와 개수에 따라 나에게 맞는 요금제를 선택하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* 무료 요금제 카드 */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 md:p-10 flex flex-col">
            <h3 className="text-xl font-bold text-[#171A1F] mb-2">기본 검증 (무료)</h3>
            <p className="text-sm text-[#737983] mb-6">
              간단하게 프랜차이즈 계약 요건을 확인하고 싶을 때
            </p>
            <div className="text-4xl font-bold text-[#171A1F] mb-8">
              0<span className="text-lg font-medium text-[#737983] ml-1">원</span>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              <FeatureItem text="최대 3개 브랜드 검증 가능" />
              <FeatureItem text="기본 위험도 리포트 제공" />
              <FeatureItem text="직접 입력 기반의 자가 진단" />
            </div>

            <Link
              href="/dashboard"
              className="w-full py-4 rounded-xl font-semibold text-center border-2 border-[#E5E7EB] text-[#171A1F] hover:bg-gray-50 transition-colors"
            >
              현재 이용 중인 플랜
            </Link>
          </div>

          {/* 프리미엄 요금제 카드 */}
          <div className="bg-[#171A1F] rounded-3xl border border-gray-800 p-8 md:p-10 flex flex-col relative overflow-hidden shadow-2xl">
            {/* 장식용 그라데이션 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">프리미엄 검증</h3>
                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap size={12} fill="currentColor" /> 추천
                </span>
              </div>
              <p className="text-sm text-white/60 mb-6">
                복잡한 정보공개서 분석부터 무제한 브랜드 비교까지
              </p>
              <div className="text-4xl font-bold text-white mb-8">
                29,000<span className="text-lg font-medium text-white/60 ml-1">원</span>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                <FeatureItem text="무제한 브랜드 검증 가능" dark />
                <FeatureItem text="AI 심층 문서 분석 (정보공개서 독소조항)" dark />
                <FeatureItem text="상세 상권 분석 및 객단가 시뮬레이션" dark />
                <FeatureItem text="PDF 리포트 다운로드 및 인쇄" dark />
              </div>

              <Link href="#"
                // client directive가 없어서 alert 불가. Link 사용.
                className="w-full py-4 rounded-xl font-semibold text-center bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 block"
              >
                프리미엄으로 업그레이드
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center flex flex-col items-center justify-center">
          <ShieldCheck size={48} className="text-[#E5E7EB] mb-4" />
          <p className="text-sm text-[#737983]">
            가맹검증은 예비 창업자의 안전한 계약을 돕는 독립적인 제3자 서비스입니다.<br/>
            특정 프랜차이즈 본사로부터 어떠한 금전적 대가도 받지 않습니다.
          </p>
        </div>
      </main>
    </div>
  )
}

function FeatureItem({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${dark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
        <Check size={12} strokeWidth={3} />
      </div>
      <span className={`text-sm leading-relaxed ${dark ? 'text-white/90' : 'text-[#171A1F]'}`}>
        {text}
      </span>
    </div>
  )
}
