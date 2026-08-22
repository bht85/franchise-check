import type {
  Question,
  QuestionAnswer,
  DocumentExtraction,
  RiskResult,
  RiskFlag,
  FollowupQuestion,
  FinalVerdict,
  Brand,
  RiskFlagType,
  RiskSeverity,
} from '@/types'
import { formatKRW } from '@/types'
import { nanoid } from 'nanoid'

// ============================================================
// 리스크 계산 엔진
// ============================================================

export interface UserSituation {
  own_capital: number | null
  use_loan: string | null
  monthly_loan_payment: number | null
  has_experience: boolean | null
  operation_style: string | null
  target_monthly_profit: number | null
  monthly_living_cost: number | null
}

export interface RiskEngineInput {
  sessionId: string
  questions: Question[]
  answers: Record<string, QuestionAnswer>         // question_id → answer
  answersByKey: Record<string, QuestionAnswer>    // question_key → answer
  extractions: DocumentExtraction[]
  brand: Brand
  userSituation: UserSituation
}

export interface RiskEngineOutput {
  result: Omit<RiskResult, 'id' | 'calculated_at'>
  flags: Omit<RiskFlag, 'id' | 'created_at'>[]
  followupQuestions: Omit<FollowupQuestion, 'id' | 'created_at'>[]
  verdict: FinalVerdict
}

// 헬퍼: 질문 키로 답변 값 가져오기
function getAnswerValue(
  answersByKey: Record<string, QuestionAnswer>,
  key: string
): unknown {
  return answersByKey[key]?.answer_value ?? null
}

function getAnswerState(
  answersByKey: Record<string, QuestionAnswer>,
  key: string
) {
  return answersByKey[key]?.answer_state ?? 'not_checked'
}

// 헬퍼: 문서 추출값 가져오기
function getExtraction(
  extractions: DocumentExtraction[],
  field: string
): DocumentExtraction | undefined {
  return extractions.find((e) => e.field_key === field && e.confidence !== 'not_found')
}

// 헬퍼: 금액 비교 (차이 비율)
function pctDiff(a: number, b: number): number {
  if (b === 0) return 0
  return Math.abs((a - b) / b)
}

// ──────────────────────────────────────────────────────────

export class RiskEngine {
  calculate(input: RiskEngineInput): RiskEngineOutput {
    const flags = this.detectAll(input)
    const result = this.calcScores(input, flags)
    const followupQuestions = this.generateFollowupQuestions(flags, input)
    const verdict = this.determineVerdict(result, flags)

    return { result, flags, followupQuestions, verdict }
  }

  // ── 점수 계산 ──────────────────────────────────────────

  private calcScores(
    input: RiskEngineInput,
    flags: Omit<RiskFlag, 'id' | 'created_at'>[]
  ): Omit<RiskResult, 'id' | 'calculated_at'> {
    return {
      session_id: input.sessionId,
      readiness_score: this.calcReadiness(input, flags),
      info_check_score: this.calcInfoCheck(input),
      financial_burden_score: this.calcFinancialBurden(input),
      hq_transparency_score: this.calcHqTransparency(input),
      contract_check_score: this.calcContractCheck(input),
      sales_check_score: this.calcSalesCheck(input),
      operation_fit_score: this.calcOperationFit(input),
      total_missing_risk: this.calcMissingRisk(input, flags),
    }
  }

  /** 계약 준비도: 핵심 항목 확인 여부 종합 */
  private calcReadiness(
    input: RiskEngineInput,
    flags: Omit<RiskFlag, 'id' | 'created_at'>[]
  ): number {
    const criticalFlags = flags.filter((f) => f.severity === 'critical').length
    const warningFlags = flags.filter((f) => f.severity === 'warning').length
    let score = 100
    score -= criticalFlags * 20
    score -= warningFlags * 8
    return Math.max(0, Math.min(100, score))
  }

  /** 정보 확인도: answered/total 비율 */
  private calcInfoCheck(input: RiskEngineInput): number {
    const { questions, answersByKey } = input
    if (questions.length === 0) return 0
    let totalWeight = 0
    let confirmedWeight = 0
    for (const q of questions) {
      if (!q.is_active) continue
      totalWeight += q.risk_weight
      const state = getAnswerState(answersByKey, q.question_key)
      if (state === 'confirmed') {
        confirmedWeight += q.risk_weight
      } else if (state === 'unknown') {
        confirmedWeight += q.risk_weight * 0.3  // 모름은 30% 인정
      }
    }
    if (totalWeight === 0) return 0
    return Math.round((confirmedWeight / totalWeight) * 100)
  }

  /** 재무 부담도: 높을수록 위험 */
  private calcFinancialBurden(input: RiskEngineInput): number {
    const { userSituation, answersByKey } = input
    let burden = 0

    // 자기자본 대비 투자비 비율
    const ownCapital = userSituation.own_capital ?? 0
    const interiorCost = Number(getAnswerValue(answersByKey, 'interior_cost_confirmed') ?? 0)
    const franchiseFee = Number(getAnswerValue(answersByKey, 'franchise_fee_confirmed') ?? 0)
    const equipment = Number(getAnswerValue(answersByKey, 'equipment_cost_confirmed') ?? 0)
    const deposit = Number(getAnswerValue(answersByKey, 'deposit_confirmed') ?? 0)
    const inventory = Number(getAnswerValue(answersByKey, 'initial_inventory_cost') ?? 0)
    const operatingFund = Number(getAnswerValue(answersByKey, 'initial_operating_fund') ?? 0)

    const totalInvestment = interiorCost + franchiseFee + equipment + deposit + inventory
    const totalNeeded = totalInvestment + operatingFund

    if (ownCapital > 0 && totalNeeded > 0) {
      const ratio = totalNeeded / ownCapital
      if (ratio > 2.0) burden += 40       // 자기자본 2배 초과
      else if (ratio > 1.5) burden += 25  // 1.5배 초과
      else if (ratio > 1.0) burden += 15  // 자기자본 초과
    }

    // 대출 비중
    const loanPlan = userSituation.use_loan
    if (loanPlan === 'major') burden += 25
    else if (loanPlan === 'partial') burden += 10

    // 월 원리금 + 생활비 vs 목표 순수익
    const monthlyLoan = userSituation.monthly_loan_payment ?? 0
    const livingCost = userSituation.monthly_living_cost ?? 0
    const targetProfit = userSituation.target_monthly_profit ?? 0
    const monthlyFixed = monthlyLoan + livingCost

    if (targetProfit > 0 && monthlyFixed > 0) {
      if (monthlyFixed >= targetProfit) burden += 35  // 고정비가 목표 수익 초과
      else if (monthlyFixed >= targetProfit * 0.7) burden += 15
    }

    return Math.min(100, burden)
  }

  /** 본사 정보 투명성 */
  private calcHqTransparency(input: RiskEngineInput): number {
    const { answersByKey } = input
    let score = 100

    // 예상매출액 산정서 미제공
    const salesEstimate = getAnswerValue(answersByKey, 'sales_estimate_received')
    if (salesEstimate === 'not_requested') score -= 20
    else if (salesEstimate === 'requested_not_received') score -= 30
    else if (salesEstimate === 'unknown') score -= 35

    // 매출 산정 기준 미설명
    const salesDocReceived = getAnswerValue(answersByKey, 'hq_sales_doc_received')
    if (salesDocReceived === 'no') score -= 15
    else if (salesDocReceived === 'unknown') score -= 20

    // 영업지역 모름
    const territory = getAnswerValue(answersByKey, 'hq_claimed_territory')
    if (territory === 'unknown') score -= 10

    return Math.max(0, score)
  }

  /** 계약조건 확인도 */
  private calcContractCheck(input: RiskEngineInput): number {
    const { answersByKey } = input
    const contractKeys = [
      'contract_term', 'renewal_conditions', 'early_termination',
      'territory_in_contract', 'remodeling_obligation',
      'non_compete_clause', 'transfer_restriction',
    ]
    let confirmedCount = 0
    for (const key of contractKeys) {
      const state = getAnswerState(answersByKey, key)
      if (state === 'confirmed') confirmedCount++
    }
    return Math.round((confirmedCount / contractKeys.length) * 100)
  }

  /** 매출정보 확인도 */
  private calcSalesCheck(input: RiskEngineInput): number {
    const { answersByKey } = input
    let score = 0
    const checks: Array<[string, number]> = [
      ['disclosure_avg_sales', 25],
      ['sales_estimate_received', 25],
      ['sales_includes_all_stores', 15],
      ['top_store_concentration', 15],
      ['sales_calculation_period', 10],
      ['sales_store_count', 10],
    ]
    for (const [key, weight] of checks) {
      const state = getAnswerState(answersByKey, key)
      const val = getAnswerValue(answersByKey, key)
      if (state === 'confirmed' || (val && val !== 'unknown' && val !== 'not_checked')) {
        score += weight
      }
    }
    return Math.min(100, score)
  }

  /** 운영 적합도 */
  private calcOperationFit(input: RiskEngineInput): number {
    const { userSituation } = input
    let score = 70  // 기본값

    if (userSituation.has_experience === true) score += 15
    else if (userSituation.has_experience === false) score -= 10

    if (userSituation.operation_style === 'full_time') score += 10
    else if (userSituation.operation_style === 'employee') score -= 10

    return Math.max(0, Math.min(100, score))
  }

  /** 전체 미확인 위험 (높을수록 위험) */
  private calcMissingRisk(
    input: RiskEngineInput,
    flags: Omit<RiskFlag, 'id' | 'created_at'>[]
  ): number {
    const { questions, answersByKey } = input
    let risk = 0
    for (const q of questions) {
      if (!q.is_active) continue
      const state = getAnswerState(answersByKey, q.question_key)
      if (state === 'not_checked') risk += q.risk_weight
      else if (state === 'unknown') risk += q.missing_weight
    }
    // critical 플래그 추가 가중치
    const criticalCount = flags.filter((f) => f.severity === 'critical').length
    risk += criticalCount * 5
    // 0~100 정규화 (최대 가정: 모든 질문 미확인)
    const maxRisk = questions.reduce((s, q) => s + q.risk_weight, 0) + 30
    return Math.min(100, Math.round((risk / maxRisk) * 100))
  }

  // ── 불일치 및 위험 탐지 ────────────────────────────────

  private detectAll(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    return [
      ...this.detectSalesDiscrepancy(input),
      ...this.detectRoyaltyDiscrepancy(input),
      ...this.detectInteriorDiscrepancy(input),
      ...this.detectFinancialRisk(input),
      ...this.detectMissingCritical(input),
      ...this.detectOwnerVerification(input),
    ]
  }

  /** 불일치 1: 본사 구두 매출 vs 정보공개서 매출 */
  private detectSalesDiscrepancy(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    const flags: Omit<RiskFlag, 'id' | 'created_at'>[] = []
    const hqSales = Number(getAnswerValue(input.answersByKey, 'hq_claimed_monthly_sales') ?? 0)
    const docSales = Number(getAnswerValue(input.answersByKey, 'disclosure_avg_sales') ?? 0)
    const extractedSales = getExtraction(input.extractions, 'average_sales')

    // 사용자 입력 간 비교
    if (hqSales > 0 && docSales > 0) {
      const diff = pctDiff(hqSales, docSales)
      if (diff >= 0.15) {
        flags.push({
          session_id: input.sessionId,
          flag_type: 'discrepancy',
          severity: diff >= 0.3 ? 'critical' : 'warning',
          title: '본사 설명 매출과 정보공개서 매출 차이 발견',
          description: `본사 담당자가 설명한 월 평균 매출(${formatKRW(hqSales)})과 정보공개서에 기재된 평균 매출(${formatKRW(docSales)}) 사이에 ${Math.round(diff * 100)}% 차이가 있습니다. 계약 전 본사에 차이의 원인을 확인하세요.`,
          related_question_ids: [],
          related_doc_fields: ['average_sales'],
        })
      }
    }

    // 문서 추출값과 사용자 입력 비교
    if (extractedSales?.extracted_value && hqSales > 0) {
      const extractedNum = Number(extractedSales.extracted_value.replace(/[^0-9]/g, ''))
      if (extractedNum > 0) {
        const diff = pctDiff(hqSales, extractedNum)
        if (diff >= 0.15) {
          flags.push({
            session_id: input.sessionId,
            flag_type: 'discrepancy',
            severity: diff >= 0.3 ? 'critical' : 'warning',
            title: '본사 설명 매출과 업로드 문서 수치 차이',
            description: `본사 담당자가 설명한 매출과 업로드된 문서에서 추출된 수치 간에 ${Math.round(diff * 100)}% 차이가 있습니다. 추출 출처: ${extractedSales.source_text?.substring(0, 80) ?? '문서'}.`,
            related_question_ids: [],
            related_doc_fields: ['average_sales'],
          })
        }
      }
    }

    return flags
  }

  /** 불일치 2: 본사 구두 "로열티 없음" vs 계약서 로열티 존재 */
  private detectRoyaltyDiscrepancy(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    const flags: Omit<RiskFlag, 'id' | 'created_at'>[] = []
    const hqRoyalty = getAnswerValue(input.answersByKey, 'hq_claimed_royalty')
    const contractRoyalty = getAnswerValue(input.answersByKey, 'royalty_confirmed')
    const extractedRoyalty = getExtraction(input.extractions, 'royalty')

    // 구두 없음 → 계약서 확인 내용 있음
    if (hqRoyalty === 'none' && contractRoyalty && String(contractRoyalty).trim() !== '') {
      flags.push({
        session_id: input.sessionId,
        flag_type: 'discrepancy',
        severity: 'critical',
        title: '로열티 관련 설명과 계약서 내용 차이 발견',
        description: '본사 담당자가 로열티가 없다고 설명했으나, 계약서 또는 문서에서 로열티 관련 내용이 확인됩니다. 계약 전 본사에 정확한 조건을 확인하세요.',
        related_question_ids: [],
        related_doc_fields: ['royalty'],
      })
    }

    // 구두 없음 → 문서 추출 로열티 있음
    if (hqRoyalty === 'none' && extractedRoyalty?.confidence !== 'not_found') {
      flags.push({
        session_id: input.sessionId,
        flag_type: 'discrepancy',
        severity: 'critical',
        title: '로열티: 본사 설명과 업로드 문서 차이',
        description: `본사는 로열티가 없다고 설명했으나, 업로드된 문서에서 로열티 관련 항목이 발견되었습니다. 출처: ${extractedRoyalty?.source_text?.substring(0, 80) ?? '문서'}.`,
        related_question_ids: [],
        related_doc_fields: ['royalty'],
      })
    }

    return flags
  }

  /** 불일치 3: 본사 인테리어 설명 vs 견적서 */
  private detectInteriorDiscrepancy(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    const flags: Omit<RiskFlag, 'id' | 'created_at'>[] = []
    const hqInterior = Number(getAnswerValue(input.answersByKey, 'hq_claimed_interior_cost') ?? 0)
    const confirmedInterior = Number(getAnswerValue(input.answersByKey, 'interior_cost_confirmed') ?? 0)

    if (hqInterior > 0 && confirmedInterior > 0) {
      const diff = pctDiff(confirmedInterior, hqInterior)
      if (diff >= 0.2) {
        flags.push({
          session_id: input.sessionId,
          flag_type: 'discrepancy',
          severity: diff >= 0.4 ? 'critical' : 'warning',
          title: '인테리어 비용: 본사 설명과 견적서 차이',
          description: `본사가 설명한 인테리어 비용(${formatKRW(hqInterior)})과 확인된 견적서 금액(${formatKRW(confirmedInterior)}) 사이에 ${Math.round(diff * 100)}% 차이가 있습니다. 견적서를 공식 문서로 받아 내역을 확인하세요.`,
          related_question_ids: [],
          related_doc_fields: ['interior_cost'],
        })
      }
    }

    return flags
  }

  /** 재무 위험 */
  private detectFinancialRisk(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    const flags: Omit<RiskFlag, 'id' | 'created_at'>[] = []
    const { userSituation, answersByKey } = input

    const ownCapital = userSituation.own_capital ?? 0
    const interiorCost = Number(getAnswerValue(answersByKey, 'interior_cost_confirmed') ?? 0)
    const franchiseFee = Number(getAnswerValue(answersByKey, 'franchise_fee_confirmed') ?? 0)
    const equipment = Number(getAnswerValue(answersByKey, 'equipment_cost_confirmed') ?? 0)
    const operatingFund = Number(getAnswerValue(answersByKey, 'initial_operating_fund') ?? 0)
    const totalInvestment = interiorCost + franchiseFee + equipment

    // 자기자본 < 총 투자비 + 운영자금
    if (ownCapital > 0 && totalInvestment > 0) {
      const totalNeeded = totalInvestment + operatingFund
      if (totalNeeded > ownCapital) {
        flags.push({
          session_id: input.sessionId,
          flag_type: 'financial_risk',
          severity: totalNeeded > ownCapital * 1.5 ? 'critical' : 'warning',
          title: '자기자본이 총 필요 금액보다 부족',
          description: `현재 확인된 초기 투자비와 운영자금 합계(${formatKRW(totalNeeded)})가 자기자본(${formatKRW(ownCapital)})을 초과합니다. 부족분 ${formatKRW(totalNeeded - ownCapital)}에 대한 자금 계획을 확인하세요.`,
          related_question_ids: [],
          related_doc_fields: [],
        })
      }
    }

    // 월 원리금 + 생활비 > 목표 순수익
    const monthlyLoan = userSituation.monthly_loan_payment ?? 0
    const livingCost = userSituation.monthly_living_cost ?? 0
    const targetProfit = userSituation.target_monthly_profit ?? 0
    if (monthlyLoan > 0 && livingCost > 0 && targetProfit > 0) {
      const monthlyFixed = monthlyLoan + livingCost
      if (monthlyFixed >= targetProfit) {
        flags.push({
          session_id: input.sessionId,
          flag_type: 'financial_risk',
          severity: 'critical',
          title: '월 고정 지출이 목표 순수익 초과',
          description: `월 대출 원리금(${formatKRW(monthlyLoan)})과 생활비(${formatKRW(livingCost)}) 합계(${formatKRW(monthlyFixed)})가 목표 월 순수익(${formatKRW(targetProfit)})과 같거나 초과합니다. 실제 수익이 목표보다 낮을 경우 자금 부족이 발생할 수 있습니다.`,
          related_question_ids: [],
          related_doc_fields: [],
        })
      }
    }

    return flags
  }

  /** 핵심 미확인 항목 */
  private detectMissingCritical(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    const flags: Omit<RiskFlag, 'id' | 'created_at'>[] = []
    const { answersByKey } = input

    const criticalItems: Array<{ key: string; title: string; description: string }> = [
      {
        key: 'sales_estimate_received',
        title: '예상매출액 산정서를 받지 못했거나 요청하지 않음',
        description: '예상매출액 산정서는 가맹사업법상 의무 제공 문서입니다. 계약 전 반드시 본사에 요청하세요.',
      },
      {
        key: 'early_termination',
        title: '중도해지 조건을 확인하지 않음',
        description: '중도해지 위약금과 조건은 향후 사업 중단 시 큰 영향을 미칩니다. 계약서에서 반드시 확인하세요.',
      },
      {
        key: 'territory_in_contract',
        title: '영업지역 계약서 명시 여부를 확인하지 않음',
        description: '구두 약속과 달리 계약서에 영업지역이 없으면 법적 보호를 받을 수 없습니다.',
      },
    ]

    for (const item of criticalItems) {
      const state = getAnswerState(answersByKey, item.key)
      const val = getAnswerValue(answersByKey, item.key)
      const isMissing =
        state === 'not_checked' ||
        state === 'unknown' ||
        val === 'not_requested' ||
        val === 'unknown'

      if (isMissing) {
        flags.push({
          session_id: input.sessionId,
          flag_type: 'missing_critical',
          severity: 'critical',
          title: item.title,
          description: item.description,
          related_question_ids: [],
          related_doc_fields: [],
        })
      }
    }

    return flags
  }

  /** 실제 점주 확인 미이행 */
  private detectOwnerVerification(input: RiskEngineInput): Omit<RiskFlag, 'id' | 'created_at'>[] {
    const flags: Omit<RiskFlag, 'id' | 'created_at'>[] = []
    const ownerContacted = getAnswerValue(input.answersByKey, 'actual_owner_contacted')

    if (ownerContacted !== 'yes') {
      flags.push({
        session_id: input.sessionId,
        flag_type: 'missing_critical',
        severity: 'critical',
        title: '실제 가맹점주와 대화하지 않음',
        description: '실제 점주와의 대화는 본사 설명과 현실의 차이를 가장 직접적으로 확인할 수 있는 방법입니다. 계약 전 최소 2~3명의 현직 점주와 대화해보세요.',
        related_question_ids: [],
        related_doc_fields: [],
      })
    }

    return flags
  }

  // ── 최종 판단 ─────────────────────────────────────────

  private determineVerdict(
    result: Omit<RiskResult, 'id' | 'calculated_at'>,
    flags: Omit<RiskFlag, 'id' | 'created_at'>[]
  ): FinalVerdict {
    const criticalCount = flags.filter((f) => f.severity === 'critical').length

    if (criticalCount >= 3) return 'expert_consultation'
    if (criticalCount >= 1 || result.readiness_score < 40) return 'need_more_info'
    if (result.readiness_score >= 80 && result.info_check_score >= 70) return 'well_confirmed'
    return 'mostly_confirmed'
  }

  // ── 본사에 물어볼 질문 자동 생성 ────────────────────────

  generateFollowupQuestions(
    flags: Omit<RiskFlag, 'id' | 'created_at'>[],
    input: RiskEngineInput
  ): Omit<FollowupQuestion, 'id' | 'created_at'>[] {
    const questions: Omit<FollowupQuestion, 'id' | 'created_at'>[] = []
    const { answersByKey, sessionId } = input

    let priority = 1

    // 매출 불일치 → 질문 생성
    const salesDiscrepancy = flags.find(
      (f) => f.flag_type === 'discrepancy' && f.title.includes('매출')
    )
    if (salesDiscrepancy) {
      const hqSales = Number(getAnswerValue(answersByKey, 'hq_claimed_monthly_sales') ?? 0)
      const docSales = Number(getAnswerValue(answersByKey, 'disclosure_avg_sales') ?? 0)
      questions.push({
        session_id: sessionId,
        question_text: `상담 과정에서 안내받은 월 평균 매출(${formatKRW(hqSales)})과 정보공개서에 기재된 평균 매출(${formatKRW(docSales)}) 수치가 다른 이유가 무엇인지 설명 부탁드립니다.`,
        context: '본사 구두 설명과 정보공개서 수치 간 차이가 확인되었습니다.',
        priority: priority++,
        is_answered: false,
      })
      questions.push({
        session_id: sessionId,
        question_text: '각 매출 수치의 산정 기준(기간, 대상 매장 수, 포함 여부)을 확인할 수 있는 자료를 요청드립니다.',
        context: '매출 산정 근거 자료 요청',
        priority: priority++,
        is_answered: false,
      })
    }

    // 로열티 불일치
    const royaltyDiscrepancy = flags.find(
      (f) => f.flag_type === 'discrepancy' && f.title.includes('로열티')
    )
    if (royaltyDiscrepancy) {
      questions.push({
        session_id: sessionId,
        question_text: '상담 시 로열티가 없다고 안내받았으나, 계약 관련 문서에서 로열티 관련 조항이 확인됩니다. 실제 계약 조건에서 로열티가 존재하는지, 있다면 금액 또는 비율과 납부 방식을 정확히 알려주세요.',
        context: '로열티 관련 본사 설명과 문서 내용 불일치',
        priority: priority++,
        is_answered: false,
      })
    }

    // 인테리어 불일치
    const interiorDiscrepancy = flags.find(
      (f) => f.flag_type === 'discrepancy' && f.title.includes('인테리어')
    )
    if (interiorDiscrepancy) {
      questions.push({
        session_id: sessionId,
        question_text: '안내받은 인테리어 예상 비용과 실제 견적서 금액 사이에 차이가 있습니다. 견적서 금액 기준의 공식 항목별 내역서를 제공해주실 수 있나요?',
        context: '인테리어 비용 설명과 견적서 차이',
        priority: priority++,
        is_answered: false,
      })
    }

    // 예상매출액 산정서 미수령
    const salesEstimate = getAnswerValue(answersByKey, 'sales_estimate_received')
    if (salesEstimate !== 'received') {
      questions.push({
        session_id: sessionId,
        question_text: '예상매출액 산정서를 아직 받지 못했습니다. 계약 체결 전 예상매출액 산정서를 공식적으로 교부해주시기 바랍니다.',
        context: '가맹사업법상 의무 서류인 예상매출액 산정서 요청',
        priority: priority++,
        is_answered: false,
      })
    }

    // 영업지역 미확인
    const territory = getAnswerValue(answersByKey, 'territory_in_contract')
    if (territory === 'not_checked' || !territory) {
      questions.push({
        session_id: sessionId,
        question_text: '계약서상 영업지역(상권 보호) 조항의 정확한 내용과 범위, 동일 브랜드의 추가 출점 관련 조건을 확인하고 싶습니다. 관련 계약서 조항을 설명해주세요.',
        context: '영업지역 보호 조건 확인 필요',
        priority: priority++,
        is_answered: false,
      })
    }

    // 중도해지 미확인
    const earlyTermination = getAnswerValue(answersByKey, 'early_termination')
    if (earlyTermination === 'not_checked' || !earlyTermination) {
      questions.push({
        session_id: sessionId,
        question_text: '계약 기간 중 가맹점이 중도 해지를 요청할 수 있는 조건과 이 경우 발생하는 위약금의 계산 방식을 구체적으로 알고 싶습니다.',
        context: '중도해지 조건 및 위약금 확인',
        priority: priority++,
        is_answered: false,
      })
    }

    // 필수 확인 공통 질문 (항상 추가하여 퀄리티 향상)
    questions.push({
      session_id: sessionId,
      question_text: '계약 중도 해지 시 영업 위약금과 시설 위약금의 구체적인 산정 방식(비율)을 서면으로 확인하고 싶습니다.',
      context: '중도해지 관련 위약금 명확화',
      priority: priority++,
      is_answered: false,
    })

    questions.push({
      session_id: sessionId,
      question_text: '최근 1년 이내에 본사와 가맹점 간의 분쟁(공정위 신고, 소송 등)이 발생한 건수가 있다면 대략적인 사유를 알려주세요.',
      context: '본사 투명성 및 가맹점 관리 실태 파악',
      priority: priority++,
      is_answered: false,
    })

    questions.push({
      session_id: sessionId,
      question_text: '오픈 이후 본사 슈퍼바이저(SV)의 정기적인 방문 빈도와 구체적인 매장 운영 지원 매뉴얼이 있다면 확인하고 싶습니다.',
      context: '사후 관리 및 운영 지원 확인',
      priority: priority++,
      is_answered: false,
    })

    return questions.slice(0, 10)  // 최대 10개
  }
}
