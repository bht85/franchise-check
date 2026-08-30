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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* 무료 요금제 카드 */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 flex flex-col">
            <h3 className="text-xl font-bold text-[#171A1F] mb-2">첫 검증 무료</h3>
            <p className="text-sm text-[#737983] mb-6">최초 1회, 프랜차이즈 계약의 기본 요건을 안전하게 확인</p>
            <div className="text-4xl font-bold text-[#171A1F] mb-8">
              0<span className="text-lg font-medium text-[#737983] ml-1">원</span>
            </div>
            <div className="flex-1 space-y-4 mb-8">
              <FeatureItem text="최초 1회 기본 검증 무료" />
              <FeatureItem text="기본 위험도 리포트 제공" />
              <FeatureItem text="가맹점/본사 신뢰도 평가" />
              <FeatureItem text="직접 입력 기반의 자가 진단" />
            </div>
            <Link
              href="/dashboard"
              className="w-full py-4 rounded-xl font-semibold text-center border-2 border-[#E5E7EB] text-[#171A1F] hover:bg-gray-50 transition-colors"
            >
              현재 이용 중
            </Link>
          </div>

          {/* 추가 검증권 */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 flex flex-col relative">
            <h3 className="text-xl font-bold text-[#171A1F] mb-2">추가 검증권</h3>
            <p className="text-sm text-[#737983] mb-6">비교하고 싶은 브랜드가 여러 개일 때, 단건으로 추가</p>
            <div className="text-4xl font-bold text-[#171A1F] mb-8">
              5,000<span className="text-lg font-medium text-[#737983] ml-1">원</span><span className="text-sm text-gray-400 font-normal ml-1">/ 1회</span>
            </div>
            <div className="flex-1 space-y-4 mb-8">
              <FeatureItem text="새로운 프랜차이즈 1개 추가 검증" />
              <FeatureItem text="기존 내 정보(자본금 등) 연동" />
              <FeatureItem text="여러 브랜드 위험도 비교 가능" />
            </div>
            <Link 
              href="#" 
              className="w-full py-4 rounded-xl font-semibold text-center border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              추가권 구매하기
            </Link>
          </div>

          {/* 프리미엄 요금제 카드 */}
          <div className="bg-[#171A1F] rounded-3xl border border-gray-800 p-8 flex flex-col relative overflow-hidden shadow-2xl md:transform md:-translate-y-4">
            {/* 장식용 그라데이션 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">프리미엄 AI 리포트</h3>
                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap size={12} fill="currentColor" /> 추천
                </span>
              </div>
              <p className="text-sm text-white/60 mb-6">
                전문가 수준의 심층 문서 분석이 필요할 때
              </p>
              <div className="text-4xl font-bold text-white mb-8">
                5,000<span className="text-lg font-medium text-white/60 ml-1">원</span><span className="text-sm text-white/40 font-normal ml-1">/ 1회</span>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                <FeatureItem text="AI 심층 문서 분석 (주의 조항 등)" dark />
                <FeatureItem text="객단가 및 손익분기점 시뮬레이션" dark />
                <FeatureItem text="상세 상권 분석 데이터 제공" dark />
                <FeatureItem text="리포트 PDF 다운로드 및 인쇄" dark />
              </div>

              <Link href="#"
                className="w-full py-4 rounded-xl font-semibold text-center bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
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
