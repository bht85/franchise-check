'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle2, Loader2, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DOCUMENT_TYPE_LABELS } from '@/types'
import type { DocumentType } from '@/types'

interface Props {
  sessionId: string
  remainingCount?: number
  expiryDate?: string
}

const DOC_TYPES: { type: DocumentType; label: string; desc: string; important: boolean }[] = [
  { type: 'disclosure_doc', label: '정보공개서', desc: '가장 중요한 문서입니다.', important: true },
  { type: 'contract', label: '가맹계약서', desc: '계약 조건을 확인합니다.', important: true },
  { type: 'sales_estimate', label: '예상매출액 산정서', desc: '매출 근거를 분석합니다.', important: true },
  { type: 'quote', label: '인테리어 견적서', desc: '비용 불일치를 탐지합니다.', important: false },
  { type: 'hq_material', label: '본사 제공 자료', desc: '기타 본사 문서', important: false },
]

interface UploadedDoc {
  documentId: string
  docType: DocumentType
  filename: string
  status: 'uploaded' | 'analyzing' | 'done' | 'error'
  extractionCount?: number
}

export default function DocumentUploadClient({ sessionId, remainingCount = 5, expiryDate = '결제일로부터 7일' }: Props) {
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadedDoc[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  const handleFileSelect = async (docType: DocumentType, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_id', sessionId)
    formData.append('doc_type', docType)

    const tempId = `temp-${Date.now()}`
    setUploads((prev) => [
      ...prev.filter((u) => u.docType !== docType),
      { documentId: tempId, docType, filename: file.name, status: 'uploaded' },
    ])

    try {
      // 업로드
      const uploadRes = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error)

      const documentId = uploadData.document.id as string

      setUploads((prev) =>
        prev.map((u) =>
          u.documentId === tempId
            ? { ...u, documentId, status: 'analyzing' }
            : u
        )
      )

      // AI 분석
      const analyzeRes = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      })
      const analyzeData = await analyzeRes.json()

      setUploads((prev) =>
        prev.map((u) =>
          u.documentId === documentId
            ? {
                ...u,
                status: analyzeRes.ok ? 'done' : 'error',
                extractionCount: analyzeData.extraction_count,
              }
            : u
        )
      )
    } catch {
      setUploads((prev) =>
        prev.map((u) => (u.documentId === tempId ? { ...u, status: 'error' } : u))
      )
    }
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const res = await fetch('/api/risk/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (!res.ok) throw new Error('분석 실패')
      router.push(`/session/${sessionId}/report`)
    } catch {
      alert('분석 중 오류가 발생했습니다.')
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto px-4 py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-between">
          <span>문서 업로드</span>
          <span className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded tracking-wider align-middle">PREMIUM</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
          관련 정보를 업로드하면 더욱 정확한 프리미엄 리포트를 생성할 수 있습니다.
        </p>
      </div>

      <div className="bg-gray-900 text-white rounded-xl p-4 mb-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-200">리포트 갱신(재분석) 횟수</p>
            <p className="text-lg font-black">{remainingCount} <span className="text-sm text-gray-400 font-medium">/ 5 회</span></p>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(remainingCount / 5) * 100}%` }}></div>
          </div>
          <div className="text-xs text-gray-400 leading-relaxed space-y-1">
            <p>• 기한: {expiryDate} 이내 사용 가능</p>
            <p>• 협상 후 <strong>수정된 계약서</strong>를 받아 다시 업로드하고 검증해보세요!</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-900 leading-relaxed">
        <p className="font-bold flex items-center gap-1.5 mb-2">
          <Info size={16} className="text-blue-700" />
          잠깐! 아직 서류를 못 받으셨나요?
        </p>
        <ul className="space-y-1.5 list-disc list-inside text-blue-800/90 ml-1">
          <li><strong>정보공개서 & 계약서:</strong> 계약 체결 <strong className="text-blue-700 font-bold">14일 전</strong> 서면 제공이 법적 의무입니다.</li>
          <li><strong>예상매출액 산정서:</strong> 중대형 프랜차이즈의 경우 서면 제공이 필수입니다.</li>
        </ul>
        <p className="mt-2 text-xs text-blue-600/80 bg-blue-100/50 p-2 rounded-lg">
          "다들 일단 가계약금부터 낸다"는 본사의 말에 휘둘리지 마시고, 서류부터 당당하게 요구하여 꼼꼼히 확인하세요!
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {DOC_TYPES.map((doc) => {
          const uploaded = uploads.find((u) => u.docType === doc.type)
          return (
            <div
              key={doc.type}
              className={cn(
                'border-2 rounded-xl p-4',
                uploaded?.status === 'done'
                  ? 'border-green-300 bg-green-50'
                  : uploaded?.status === 'analyzing'
                  ? 'border-blue-300 bg-blue-50'
                  : uploaded?.status === 'error'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{doc.label}</span>
                    {doc.important && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">권장</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                  {uploaded && (
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-48">{uploaded.filename}</p>
                  )}
                  {uploaded?.status === 'done' && (
                    <p className="text-xs text-green-600 mt-1">
                      {uploaded.extractionCount}개 항목 추출 완료
                    </p>
                  )}
                </div>
                <div className="shrink-0 ml-3">
                  {!uploaded && (
                    <label className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-100">
                      <Upload size={14} />
                      업로드
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(doc.type, file)
                        }}
                      />
                    </label>
                  )}
                  {uploaded?.status === 'analyzing' && (
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                  )}
                  {uploaded?.status === 'done' && (
                    <CheckCircle2 className="text-green-500" size={20} />
                  )}
                  {uploaded?.status === 'error' && (
                    <X className="text-red-500" size={20} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 분석 시작 */}
      <div className="sticky bottom-4">
        <button
          onClick={handleCalculate}
          disabled={isCalculating || uploads.some((u) => u.status === 'analyzing')}
          className={cn(
            'w-full font-semibold py-4 rounded-xl text-base transition-colors',
            isCalculating || uploads.some((u) => u.status === 'analyzing')
              ? 'bg-gray-100 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isCalculating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              분석 중...
            </span>
          ) : (
            '최종 리포트 생성하기'
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          업로드 문서가 없어도 설문 답변만으로 리포트를 생성할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
