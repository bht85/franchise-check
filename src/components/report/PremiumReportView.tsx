import { AlertTriangle, CheckCircle, FileText, Download, MessageCircle, Scale, ShieldAlert } from 'lucide-react'

export default function PremiumReportView({ brandName }: { brandName: string }) {
  return (
    <div className="w-full mb-8 relative">
      {/* ── 프리미엄 배너/헤더 ── */}
      <div className="bg-gray-900 rounded-t-3xl p-8 relative overflow-hidden text-white border border-gray-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Scale size={120} />
        </div>
        
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <span className="bg-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-sm tracking-widest">PREMIUM</span>
          <span className="text-white/60 text-sm font-semibold tracking-wide">AI 서류 정밀 분석 리포트</span>
        </div>
        
        <h1 className="text-2xl font-black mb-2 relative z-10 leading-snug">
          {brandName} <span className="text-white/80">계약서 및 정보공개서</span><br />
          법률 리스크 스캔 결과
        </h1>
        
        <p className="text-white/60 text-sm mb-6 max-w-[90%] relative z-10">
          총 142개 조항을 스캔하여 독소조항 및 본사 구두 설명과의 불일치 항목을 찾아냈습니다.
        </p>

        <div className="flex gap-3 text-sm font-medium relative z-10">
          <div className="bg-gray-800/80 rounded-lg px-3 py-2 flex items-center gap-2 border border-gray-700/50">
            <FileText size={16} className="text-blue-400" /> 문서 2종 스캔 완료
          </div>
          <div className="bg-gray-800/80 rounded-lg px-3 py-2 flex items-center gap-2 border border-gray-700/50">
            <CheckCircle size={16} className="text-green-400" /> 142개 조항 검토
          </div>
        </div>
      </div>

      {/* ── 심층 분석 내용 ── */}
      <div className="bg-white rounded-b-3xl border-x border-b border-gray-200 p-6 sm:p-8 shadow-sm">
        
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="text-red-600" size={24} />
          <h2 className="text-lg font-black text-gray-900">명백한 불일치 (거짓말 탐지) 2건</h2>
        </div>

        {/* ── 불일치 사례 1 ── */}
        <div className="mb-8 border border-red-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-0.5 rounded">위험도 높음</span>
              <span className="font-bold text-red-900 text-sm">로열티 조항 불일치</span>
            </div>
            <span className="text-xs text-red-400 font-medium">가맹계약서 스캔됨</span>
          </div>
          
          <div className="p-5">
            <div className="flex gap-4 mb-5">
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
                <p className="text-xs text-gray-500 font-bold mb-1">본사 안내 (설문 답변)</p>
                <p className="text-gray-900 font-medium">"우리는 로열티가 전혀 없습니다."</p>
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm z-10 text-gray-400 font-bold text-xs">VS</div>
              </div>
              <div className="flex-1 bg-red-50/50 rounded-xl p-4 border border-red-100">
                <p className="text-xs text-red-500 font-bold mb-1">실제 문서 발견 조항</p>
                <p className="text-red-900 font-medium leading-snug">"매월 총매출의 3%를 납부해야 함"</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 relative text-white">
              <p className="text-xs text-white/60 mb-2 font-bold flex items-center gap-2">
                <FileText size={14} /> 가맹계약서 원문 발췌 (14페이지)
              </p>
              <p className="text-white/90 text-sm leading-relaxed font-mono">
                제8조 (로열티 및 광고분담금)<br/>
                ① 가맹점사업자는 본사 브랜드 사용 및 경영지원의 대가로 <span className="bg-red-500/30 text-red-200 px-1 rounded">매월 총매출액의 3%</span>를 익월 10일까지 가맹본부에 납부하여야 한다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 불일치 사례 2 ── */}
        <div className="mb-8 border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded">위험도 보통</span>
              <span className="font-bold text-amber-900 text-sm">과도한 위약금 (중도해지)</span>
            </div>
            <span className="text-xs text-amber-500 font-medium">정보공개서 스캔됨</span>
          </div>
          <div className="p-5">
            <div className="bg-gray-900 rounded-xl p-4 relative mb-4 text-white">
              <p className="text-xs text-white/60 mb-2 font-bold flex items-center gap-2">
                <FileText size={14} /> 정보공개서 원문 발췌 (28페이지)
              </p>
              <p className="text-white/90 text-sm leading-relaxed font-mono">
                제14조 (중도해지 시 위약금)<br/>
                가맹점의 귀책사유로 계약이 중도 해지될 경우, <span className="bg-amber-500/30 text-amber-200 px-1 rounded">잔여 계약기간 동안 발생할 예상 로열티의 50%</span>를 위약금으로 지급한다.
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              <strong className="text-amber-700">전문가 코멘트:</strong> 잔여기간 로열티의 50%는 업계 평균 대비 매우 높은 수준입니다. 장사가 안 되어 폐업할 때 수천만 원의 위약금 폭탄을 맞을 수 있는 전형적인 독소조항입니다.
            </p>
          </div>
        </div>

        {/* ── 실전 협상 가이드 ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5">
            <MessageCircle size={100} />
          </div>
          <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2 relative z-10">
            <MessageCircle size={18} /> 본사에 카톡 보내기 (협상 가이드)
          </h3>
          <p className="text-sm text-blue-800 mb-4 relative z-10">
            계약서에 도장을 찍기 전, 본사 담당자에게 아래 내용을 그대로 복사해서 카톡을 보내 증거를 남겨두세요.
          </p>
          
          <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm relative z-10 font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            "대리님, 계약서 확인해 보았는데 궁금한 점이 있어서요.&#10;분명 상담 때는 로열티가 없다고 하셨는데, 가맹계약서 14페이지 제8조에는 '월 매출 3% 납부'라고 적혀있네요. 이 조항은 삭제된 수정 계약서로 다시 보내주실 수 있나요?&#10;구두 약속은 법적 효력이 없다고 해서 확실히 짚고 넘어가려고 합니다."
          </div>
        </div>

        {/* ── 액션 ── */}
        <button className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg">
          <Download size={18} />
          전문가용 리포트 PDF 다운로드
        </button>

      </div>
    </div>
  )
}
