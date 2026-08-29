'use client'

import { useState, useEffect } from 'react'
import { Lock, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'

interface Props {
  sessionId: string
}

function LockedSection({ title, teaser }: { title: string, teaser: string }) {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group border border-transparent hover:border-blue-200">
      <h2 className="font-bold text-gray-900 mb-4">{title}</h2>
      
      <div className="relative">
        <div className="blur-sm opacity-40 select-none pointer-events-none transition-opacity group-hover:opacity-30">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-16 bg-gray-100 rounded-xl mt-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-gray-900/5 backdrop-blur-md rounded-full p-4 mb-3 border border-gray-200/50 group-hover:scale-110 transition-transform duration-300">
            <Lock className="text-gray-700" size={24} />
          </div>
          <p className="text-sm font-bold text-gray-900 mb-1">{teaser}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1 group-hover:underline">클릭해서 프리미엄 잠금 해제하기</p>
        </div>
      </div>
    </section>
  )
}

export default function PremiumUpsell({ sessionId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 컴포넌트 마운트 시 1번만 팝업 띄우기 (로컬스토리지 활용)
  useEffect(() => {
    setMounted(true)
    const hasSeen = localStorage.getItem(`seen_paywall_${sessionId}`)
    if (!hasSeen) {
      // 약간의 지연 후 팝업 띄우기 (리포트를 조금 읽을 시간 제공)
      const timer = setTimeout(() => {
        setShowModal(true)
        localStorage.setItem(`seen_paywall_${sessionId}`, 'true')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [sessionId])

  if (!mounted) return null

  return (
    <>
      <div onClick={() => setShowModal(true)} className="space-y-6">
        <LockedSection title="📄 정보공개서 숨은 리스크" teaser="가맹비, 인테리어 비용 등 숨은 거품이 없는지 확인하세요" />
        <LockedSection title="⚖️ 가맹계약서 독소조항" teaser="과도한 위약금, 갱신 거절 사유 등 불리한 조항을 찾아냅니다" />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* 닫기 버튼 */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
            
            <div className="relative z-10 pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider">PREMIUM</span>
                <span className="text-gray-300 text-xs">AI 서류 정밀 분석</span>
              </div>
              
              <h3 className="text-white font-bold text-xl leading-snug mb-3">
                설문만으로는 알 수 없는<br />
                계약서 속 <span className="text-red-400">독소조항</span>을 찾아낼까요?
              </h3>
              
              <ul className="space-y-2.5 mb-8 mt-5">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>가맹비/인테리어비 등 <strong className="text-white">숨은 거품 검증</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>과도한 위약금 및 <strong className="text-white">독소조항 탐지</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>전문 변호사 검토 수준의 <strong className="text-white">팩트체크</strong></span>
                </li>
              </ul>

              <a 
                href={`/api/checkout?sessionId=${sessionId}`}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/50"
              >
                <Lock size={18} />
                5,000원에 잠금해제
              </a>
              <p className="text-center text-xs text-gray-500 mt-4">
                결제 후 서류를 업로드하여 정밀 분석을 시작합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
