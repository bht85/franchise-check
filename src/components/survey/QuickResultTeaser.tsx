'use client'

import { AlertTriangle, ArrowDown } from 'lucide-react'
import type { Question, QuestionAnswer } from '@/types'
import { QuestionEngine } from '@/lib/question-engine'

interface Props {
  questions: Question[]
  answers: QuestionAnswer[]
}

export default function QuickResultTeaser({ questions, answers }: Props) {
  // 간단한 Readiness Score 계산
  const quickQuestions = questions.filter(q => q.is_quick_check)
  const engine = new QuestionEngine({ questions: quickQuestions, answers })
  const activeQuickQs = engine.buildQueue()
  
  let totalWeight = 0
  let scoreWeight = 0

  activeQuickQs.forEach(q => {
    totalWeight += q.risk_weight
    const a = answers.find(ans => ans.question_id === q.id)
    if (a && a.answer_state === 'confirmed') {
      // 확인 완료 시 전체 가중치 획득
      scoreWeight += q.risk_weight
    } else if (a && a.answer_state === 'unknown') {
      // 모름 선택 시 매우 엄격하게 0점 처리 (기존 40% 획득에서 변경)
      scoreWeight += 0
    }
  })

  const score = totalWeight > 0 ? Math.round((scoreWeight / totalWeight) * 100) : 0

  // 점수에 따른 다이나믹 테마 설정
  let theme = {
    emoji: '🔴',
    colorText: 'text-red-600',
    bgLight: 'bg-red-50',
    borderLight: 'border-red-100',
    titleText: 'text-red-900',
    descText: 'text-red-700/80',
    iconColor: 'text-red-500',
    message: '다수의 핵심 항목이 확인되지 않아 매우 위험한 상태입니다.',
    subMessage: '구두로 약속받은 내용이 계약서에 없을 수도 있고, 예상치 못한 위약금 조항이 있을 수도 있습니다. 안전한 창업을 위해 정밀 점검을 반드시 진행해 주세요.'
  }

  if (score >= 80) {
    theme = {
      emoji: '🟢',
      colorText: 'text-green-600',
      bgLight: 'bg-green-50',
      borderLight: 'border-green-100',
      titleText: 'text-green-900',
      descText: 'text-green-700/80',
      iconColor: 'text-green-500',
      message: '기본적인 사항들은 훌륭하게 확인하셨습니다!',
      subMessage: '하지만 나머지 50개 항목에 치명적인 리스크나 숨겨진 위약금 조항이 있을 수 있습니다. 완벽하고 안전한 계약을 위해 정밀 점검을 마저 진행해 주세요.'
    }
  } else if (score >= 50) {
    theme = {
      emoji: '🟡',
      colorText: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      borderLight: 'border-yellow-100',
      titleText: 'text-yellow-900',
      descText: 'text-yellow-800/80',
      iconColor: 'text-yellow-500',
      message: '일부 핵심 항목이 아직 확인되지 않아 주의가 필요합니다.',
      subMessage: '모르고 넘어간 조항이 나중에 큰 비용 청구로 돌아올 수 있습니다. 안전한 창업을 위해 남은 항목들의 정밀 점검을 강력히 권장합니다.'
    }
  }

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border ${theme.borderLight} mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {theme.emoji} 현재 계약 준비도 <span className={`${theme.colorText} text-3xl font-black`}>{score}점</span>
        </h2>
        <p className="text-gray-600 text-sm">
          {theme.message}
        </p>
      </div>

      <div className={`${theme.bgLight} rounded-2xl p-4 flex gap-3 items-start mb-6`}>
        <AlertTriangle className={`${theme.iconColor} shrink-0 mt-0.5`} />
        <div>
          <h3 className={`font-bold ${theme.titleText} text-sm mb-1`}>나머지 50개 항목에 리스크가 숨어있을 수 있습니다.</h3>
          <p className={`${theme.descText} text-xs leading-relaxed`}>
            {theme.subMessage}
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
