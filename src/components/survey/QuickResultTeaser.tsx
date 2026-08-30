'use client'

import { AlertTriangle, ArrowDown } from 'lucide-react'
import type { Question, QuestionAnswer } from '@/types'

interface Props {
  questions: Question[]
  answers: QuestionAnswer[]
}

export default function QuickResultTeaser({ questions, answers }: Props) {
  // 간단한 Readiness Score 계산
  const quickQuestions = questions.filter(q => q.is_quick_check)
  
  let totalWeight = 0
  let scoreWeight = 0

  quickQuestions.forEach(q => {
    totalWeight += q.risk_weight
    const a = answers.find(ans => ans.question_id === q.id)
    if (a && a.answer_state === 'confirmed') {
      scoreWeight += q.risk_weight
    } else if (a && a.answer_state === 'unknown') {
      scoreWeight += q.risk_weight * 0.4
    }
  })

  const score = totalWeight > 0 ? Math.round((scoreWeight / totalWeight) * 100) : 0

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🔴 현재 계약 준비도 <span className="text-red-600 text-3xl font-black">{score}점</span>
        </h2>
        <p className="text-gray-600 text-sm">
          핵심 10개 항목만 점검했는데도 위험 요소가 감지되었습니다.
        </p>
      </div>

      <div className="bg-red-50 rounded-2xl p-4 flex gap-3 items-start mb-6">
        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 text-sm mb-1">나머지 50개 항목에 치명적인 리스크가 숨어있을 수 있습니다.</h3>
          <p className="text-red-700/80 text-xs leading-relaxed">
            구두로 약속받은 내용이 계약서에 없을 수도 있고, 예상치 못한 위약금 조항이 있을 수도 있습니다. 안전한 창업을 위해 정밀 점검을 계속해 주세요.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="animate-bounce mb-2">
          <ArrowDown className="text-indigo-400" size={20} />
        </div>
        <p className="text-indigo-600 font-bold text-sm">아래 카테고리를 선택하여 정밀 점검을 진행하세요</p>
      </div>
    </div>
  )
}
