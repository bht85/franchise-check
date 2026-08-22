
INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'own_capital', 'situation', 1, 1, '이번 창업에 사용할 수 있는 자기자본은 얼마인가요?', '자기자본 규모는 대출 필요성과 전체 재무 부담도를 계산하는 핵심 기준입니다. 초기 투자비용과 비교해 얼마나 안전한지 판단합니다.', 'amount', true, 4.5, 4, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'loan_plan', 'situation', 1, 2, '창업 자금에 대출을 사용할 예정인가요?', '대출 비중이 높을수록 초기 고정비(원리금)가 증가하여 매출이 낮아도 생존해야 하는 최소 매출 기준이 높아집니다.', 'select', true, 4, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '아니오, 자기자본만 사용', 0
FROM public.questions WHERE question_key = 'loan_plan'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'partial', '일부 사용할 예정 (30% 이하)', 1
FROM public.questions WHERE question_key = 'loan_plan'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'major', '상당 부분 사용할 예정 (30% 초과)', 2
FROM public.questions WHERE question_key = 'loan_plan'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '아직 모르겠음', 3
FROM public.questions WHERE question_key = 'loan_plan'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'monthly_loan_payment', 'situation', 1, 3, '대출 시 매월 갚아야 할 예상 원리금(원금+이자)은 얼마인가요?', '월 원리금은 매출과 관계없이 반드시 납부해야 하는 고정비입니다. 예상 순수익에서 이 금액을 제외해야 실제 수입을 알 수 있습니다.', 'amount', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'has_food_experience', 'situation', 1, 4, '요식업 매장 운영 경험이 있나요?', '요식업 경험 여부는 초기 운영 난이도와 본사 교육의 충분성을 평가하는 기준입니다. 경험이 없다면 교육 체계와 슈퍼바이저 지원 여부가 더 중요합니다.', 'select', true, 2, 1, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '있음 (직접 운영 경험)', 0
FROM public.questions WHERE question_key = 'has_food_experience'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'partial', '있음 (종사 경험만)', 1
FROM public.questions WHERE question_key = 'has_food_experience'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없음', 2
FROM public.questions WHERE question_key = 'has_food_experience'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'operation_style', 'situation', 1, 5, '매장 운영에 직접 참여할 예정인가요?', '직접 운영 여부는 인건비 부담과 매장 관리 리스크를 결정합니다. 직원에게 맡기면 인건비가 증가하고 초기 통제력이 낮아질 수 있습니다.', 'select', true, 2.5, 1.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'full_time', '매일 직접 운영', 0
FROM public.questions WHERE question_key = 'operation_style'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'partial', '일부 참여 (파트타임)', 1
FROM public.questions WHERE question_key = 'operation_style'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'employee', '직원에게 맡길 예정', 2
FROM public.questions WHERE question_key = 'operation_style'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'undecided', '아직 결정하지 않음', 3
FROM public.questions WHERE question_key = 'operation_style'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'expected_employee_count', 'situation', 1, 6, '예상하는 직원 수는 몇 명인가요?', '직원 수는 월 인건비를 계산하는 기준입니다. 인건비는 요식업에서 원가 다음으로 큰 고정비 항목입니다.', 'text', false, 2, 1.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'target_monthly_profit', 'situation', 1, 7, '이번 창업으로 목표하는 월 순수익은 얼마인가요?', '목표 순수익은 예상 매출과 비용을 비교할 때 기준점이 됩니다. 실제 달성 가능한 수익인지 판단하는 데 사용합니다.', 'amount', true, 3.5, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'monthly_living_cost', 'situation', 1, 8, '현재 매장을 운영하지 못할 때도 감당해야 하는 월 생활비는 얼마인가요?', '생활비는 매장 수익과 무관하게 지출되는 고정비입니다. 초기 적자기간이나 영업 중단 시 버틸 수 있는 기간을 계산하는 데 사용합니다.', 'amount', true, 4, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_claimed_monthly_sales', 'hq_consultation', 3, 1, '본사 담당자가 월 평균 매출을 얼마라고 설명했나요?', '본사가 설명한 매출은 나중에 정보공개서·실제 점주 확인 내용과 비교합니다. 차이가 있으면 반드시 본사에 확인해야 합니다.', 'amount', false, 5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_sales_is_average_of_all', 'hq_consultation', 3, 2, '본사가 설명한 그 매출이 전체 매장의 평균이라고 했나요?', '평균 매출의 산정 기준에 따라 숫자의 의미가 크게 달라집니다. 상위 매장만의 평균이면 일반 매장의 실제 매출과 큰 차이가 날 수 있습니다.', 'select', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 전체 매장 평균이라고 했음', 0
FROM public.questions WHERE question_key = 'hq_sales_is_average_of_all'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '아니오, 일부 매장 기준이라고 했음', 1
FROM public.questions WHERE question_key = 'hq_sales_is_average_of_all'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '설명을 듣지 못했음 / 모름', 2
FROM public.questions WHERE question_key = 'hq_sales_is_average_of_all'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_sales_doc_received', 'hq_consultation', 3, 3, '본사로부터 매출 관련 자료(예상매출액 산정서 등)를 문서로 받았나요?', '구두 설명은 나중에 확인하기 어렵습니다. 예상매출액 산정서는 법적으로 교부 의무가 있는 중요한 문서입니다.', 'select', false, 4.5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 문서로 받았음', 0
FROM public.questions WHERE question_key = 'hq_sales_doc_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '아니오, 구두로만 설명 받음', 1
FROM public.questions WHERE question_key = 'hq_sales_doc_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '모름', 2
FROM public.questions WHERE question_key = 'hq_sales_doc_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_claimed_franchise_fee', 'hq_consultation', 3, 4, '본사 담당자가 설명한 가맹비(가입비)는 얼마인가요?', '가맹비는 계약 시 일회성으로 납부하는 비용입니다. 정보공개서·계약서의 금액과 다를 경우 반드시 확인해야 합니다.', 'amount', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_claimed_interior_cost', 'hq_consultation', 3, 5, '본사 담당자가 설명한 인테리어 예상 비용은 얼마인가요?', '인테리어 비용은 초기 투자 중 가장 큰 비용 항목입니다. 본사 설명과 실제 견적서가 다를 경우가 많으니 반드시 확인하세요.', 'amount', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_claimed_royalty', 'hq_consultation', 3, 6, '본사 담당자가 로열티(월 지급 수수료)에 대해 어떻게 설명했나요?', '로열티는 매출에 관계없이 매월 지급하는 고정비입니다. 계약서에 명시된 조건과 구두 설명이 다른 경우가 있어 반드시 계약서로 확인해야 합니다.', 'select', false, 4.5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'none', '없다고 했음', 0
FROM public.questions WHERE question_key = 'hq_claimed_royalty'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'fixed', '있음 — 정액 (월 고정금액)', 1
FROM public.questions WHERE question_key = 'hq_claimed_royalty'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'percent', '있음 — 매출의 일정 %', 2
FROM public.questions WHERE question_key = 'hq_claimed_royalty'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '설명을 듣지 못했음 / 모름', 3
FROM public.questions WHERE question_key = 'hq_claimed_royalty'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_claimed_royalty_amount', 'hq_consultation', 3, 7, '본사가 설명한 로열티 금액 또는 비율은 얼마인가요?', '계약서와 구두 설명의 로열티 조건이 다를 경우 계약 후 분쟁의 원인이 됩니다.', 'text', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_claimed_territory', 'hq_consultation', 3, 8, '본사 담당자가 영업지역(상권) 보장에 대해 어떻게 설명했나요?', '영업지역 보장이 계약서에 명시되지 않으면 같은 브랜드의 다른 매장이 근처에 출점할 수 있습니다.', 'select', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'guaranteed', '영업지역을 보장한다고 했음', 0
FROM public.questions WHERE question_key = 'hq_claimed_territory'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_guaranteed', '보장하지 않는다고 했음', 1
FROM public.questions WHERE question_key = 'hq_claimed_territory'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'conditional', '조건부 보장이라고 했음', 2
FROM public.questions WHERE question_key = 'hq_claimed_territory'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '설명을 듣지 못했음 / 모름', 3
FROM public.questions WHERE question_key = 'hq_claimed_territory'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'franchise_fee_confirmed', 'investment', 4, 1, '가맹비(가입비)를 문서로 확인했나요? 확인했다면 금액은 얼마인가요?', '가맹비는 정보공개서 또는 계약서에 명시된 금액으로 확인해야 합니다. 구두 설명만으로는 나중에 이의를 제기하기 어렵습니다.', 'amount', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'education_fee_confirmed', 'investment', 4, 2, '교육비를 확인했나요? 확인했다면 금액은 얼마인가요?', '교육비는 초기 투자비용에 포함됩니다. 일부 본사는 교육 기간과 내용을 과장하는 경우가 있어 계약서에 명시된 내용과 비교해야 합니다.', 'amount', false, 2.5, 1.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'deposit_confirmed', 'investment', 4, 3, '가맹보증금을 확인했나요? 확인했다면 금액은 얼마인가요?', '보증금은 계약 종료 후 반환받을 수 있는 금액입니다. 반환 조건과 시기를 계약서에서 반드시 확인하세요.', 'amount', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'interior_cost_confirmed', 'investment', 4, 4, '인테리어 비용을 공식 견적서로 확인했나요? 금액은 얼마인가요?', '인테리어 비용은 초기 투자 중 가장 큰 항목입니다. 본사 설명과 실제 견적서의 차이가 큰 경우가 많으므로 반드시 견적서를 받아야 합니다.', 'amount', false, 4.5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'interior_quote_received', 'investment', 4, 5, '공식 인테리어 견적서를 본사 또는 지정 업체로부터 받으셨나요?', '구두 금액과 실제 견적서가 다른 경우가 많습니다. 견적서에는 항목별 세부 내역이 포함되어야 합니다.', 'select', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 공식 견적서를 받았음', 0
FROM public.questions WHERE question_key = 'interior_quote_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'informal', '구두 또는 간이 견적만 받음', 1
FROM public.questions WHERE question_key = 'interior_quote_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '아직 받지 못함', 2
FROM public.questions WHERE question_key = 'interior_quote_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'equipment_cost_confirmed', 'investment', 4, 6, '장비·집기 비용을 확인했나요? 금액은 얼마인가요?', '장비비는 인테리어 외에 별도로 발생하는 경우가 많습니다. 총 초기 투자비용을 정확히 계산하려면 장비비를 반드시 포함해야 합니다.', 'amount', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'initial_inventory_cost', 'investment', 4, 7, '초도물류비(초기 재고·식자재 구매비)를 확인했나요? 금액은 얼마인가요?', '초도물류비는 오픈 시 필요한 초기 재고 비용으로, 초기 투자 계산 시 빠뜨리기 쉬운 항목입니다.', 'amount', false, 2.5, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'pos_cost_confirmed', 'investment', 4, 8, 'POS 시스템 비용을 확인했나요? 금액은 얼마인가요?', 'POS는 의무 구매 대상인 경우가 많습니다. 월 사용료가 추가로 발생하는 구조인지도 확인하세요.', 'amount', false, 2, 1.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'royalty_confirmed', 'investment', 4, 9, '계약서 또는 정보공개서에서 로열티를 확인했나요? 조건은 어떻게 되나요?', '본사 구두 설명과 계약서상의 로열티 조건이 다른 경우가 있습니다. 계약서에 명시된 내용이 법적으로 유효합니다.', 'text', false, 4.5, 4, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'ad_fee_confirmed', 'investment', 4, 10, '광고분담금(마케팅 분담금)을 확인했나요? 금액 또는 비율은 얼마인가요?', '광고분담금은 매월 의무적으로 납부해야 하는 경우가 많습니다. 로열티와 별도로 청구되는 구조인지 확인하세요.', 'text', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'monthly_rent_estimated', 'investment', 4, 11, '예상 매장 임차료(월세)는 얼마인가요?', '임차료는 매출과 무관하게 고정으로 발생하는 가장 큰 운영비입니다. 아직 계약 전이면 유사 상권의 임차료를 조사해 예상 금액을 입력하세요.', 'amount', false, 4.5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'monthly_labor_cost', 'investment', 4, 12, '예상 월 인건비는 얼마인가요? (본인 인건비 제외)', '인건비는 요식업에서 원가 다음으로 큰 고정비입니다. 직접 운영 시에도 파트타임 비용이 발생할 수 있습니다.', 'amount', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'monthly_material_cost_pct', 'investment', 4, 13, '본사 또는 정보공개서에서 예상 원재료비 비율(원가율)을 확인했나요?', '원가율은 매출에서 재료비가 차지하는 비율입니다. 이 비율이 높을수록 수익이 낮아집니다. 실제 점주에게 확인하는 것이 가장 정확합니다.', 'select', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'confirmed', '확인함', 0
FROM public.questions WHERE question_key = 'monthly_material_cost_pct'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 1
FROM public.questions WHERE question_key = 'monthly_material_cost_pct'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '어떤 항목인지 모름', 2
FROM public.questions WHERE question_key = 'monthly_material_cost_pct'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'material_cost_pct_value', 'investment', 4, 14, '확인한 원재료비 비율은 몇 %인가요?', '일반적으로 요식업 원가율은 30~40% 수준입니다. 이보다 높으면 수익 여지가 줄어듭니다.', 'text', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'initial_operating_fund', 'investment', 4, 15, '오픈 초기 운영자금(예비금)으로 얼마를 준비하고 있나요?', '초기 3~6개월은 매출이 안정되지 않습니다. 초기 운영자금이 없으면 운영 중 자금 부족으로 위기가 올 수 있습니다.', 'amount', true, 4.5, 4, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'required_purchase_exists', 'investment', 4, 16, '본사 지정 업체에서 반드시 구매해야 하는 필수 구매 품목이 있나요?', '필수 구매 조항은 본사가 공급가를 결정하므로 가맹점이 가격을 협상하기 어렵습니다. 어떤 항목이 해당되는지 계약서에서 확인해야 합니다.', 'select', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes_confirmed', '예, 확인했음', 0
FROM public.questions WHERE question_key = 'required_purchase_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없다고 함', 1
FROM public.questions WHERE question_key = 'required_purchase_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 2
FROM public.questions WHERE question_key = 'required_purchase_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '모름', 3
FROM public.questions WHERE question_key = 'required_purchase_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'disclosure_avg_sales', 'sales', 5, 1, '정보공개서에 기재된 가맹점 평균 매출은 얼마인가요?', '정보공개서는 법적으로 등록된 공식 자료입니다. 본사 담당자의 구두 설명과 다를 경우 반드시 그 이유를 확인해야 합니다.', 'amount', false, 5, 4, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'sales_calculation_period', 'sales', 5, 2, '정보공개서의 매출 평균은 어느 기간을 기준으로 산정된 것인가요?', '매출 산정 기간에 따라 수치의 의미가 달라집니다. 특히 최근 1년과 개점 이후 전체 기간의 평균은 큰 차이가 날 수 있습니다.', 'select', false, 3.5, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'recent_1y', '최근 1년', 0
FROM public.questions WHERE question_key = 'sales_calculation_period'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'recent_3y', '최근 3년', 1
FROM public.questions WHERE question_key = 'sales_calculation_period'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'all_time', '개점 이후 전체 기간', 2
FROM public.questions WHERE question_key = 'sales_calculation_period'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '확인하지 못함 / 모름', 3
FROM public.questions WHERE question_key = 'sales_calculation_period'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'sales_store_count', 'sales', 5, 3, '정보공개서 매출 평균 산정에 포함된 매장 수는 몇 개인가요?', '평균 산정에 포함된 매장 수가 적으면 평균의 신뢰도가 낮습니다. 전체 매장 수 대비 비율도 확인하세요.', 'text', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'sales_includes_all_stores', 'sales', 5, 4, '그 평균이 전체 가맹점을 포함한 수치인가요?', '일부 본사는 전체 매장이 아닌 일부 우수 매장의 매출만 평균에 포함합니다. 이 경우 평균이 실제 매출보다 높게 보일 수 있습니다.', 'select', false, 4, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 전체 매장 포함', 0
FROM public.questions WHERE question_key = 'sales_includes_all_stores'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '아니오, 일부만 포함', 1
FROM public.questions WHERE question_key = 'sales_includes_all_stores'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '확인하지 못함 / 모름', 2
FROM public.questions WHERE question_key = 'sales_includes_all_stores'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'sales_estimate_received', 'sales', 5, 5, '본사로부터 예상매출액 산정서를 받으셨나요?', '예상매출액 산정서는 가맹사업법상 계약 체결 전 의무적으로 제공해야 하는 문서입니다. 받지 못했다면 본사에 공식 요청하는 것이 좋습니다.', 'select', true, 5, 4.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'received', '예, 받았음', 0
FROM public.questions WHERE question_key = 'sales_estimate_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'requested_not_received', '요청했으나 아직 받지 못함', 1
FROM public.questions WHERE question_key = 'sales_estimate_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_requested', '아직 요청하지 않음', 2
FROM public.questions WHERE question_key = 'sales_estimate_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '그런 문서가 있는지 몰랐음', 3
FROM public.questions WHERE question_key = 'sales_estimate_received'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'top_store_concentration', 'sales', 5, 6, '상위 매장에 매출이 편중되어 있는지 확인하셨나요?', '평균 매출이 높더라도 상위 몇 개 매장이 대부분을 차지하면 일반 매장의 실제 매출은 평균보다 훨씬 낮을 수 있습니다.', 'select', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'confirmed_even', '확인함 — 비교적 고르게 분포', 0
FROM public.questions WHERE question_key = 'top_store_concentration'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'confirmed_skewed', '확인함 — 상위 편중 있음', 1
FROM public.questions WHERE question_key = 'top_store_concentration'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 2
FROM public.questions WHERE question_key = 'top_store_concentration'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '모름', 3
FROM public.questions WHERE question_key = 'top_store_concentration'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'contract_term', 'contract', 6, 1, '계약 기간은 몇 년인가요?', '계약 기간 동안에는 계약 조건을 일방적으로 변경하기 어렵습니다. 계약기간이 길수록 초기 조건을 더 신중하게 검토해야 합니다.', 'text', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'renewal_conditions', 'contract', 6, 2, '계약 만료 후 재계약(갱신) 조건을 확인했나요?', '재계약 시 조건이 달라질 수 있습니다. 재계약 거절 요건, 인테리어 리뉴얼 의무 등도 함께 확인하세요.', 'select', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'confirmed', '확인했음', 0
FROM public.questions WHERE question_key = 'renewal_conditions'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 1
FROM public.questions WHERE question_key = 'renewal_conditions'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '어떤 내용인지 모름', 2
FROM public.questions WHERE question_key = 'renewal_conditions'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'early_termination', 'contract', 6, 3, '계약 기간 중 중도에 해지할 수 있는 조건을 확인했나요?', '중도해지 조건은 매우 중요합니다. 해지가 불가능하거나 위약금이 크면 매장 운영이 어려울 때도 계약을 유지해야 할 수 있습니다.', 'select', false, 4.5, 4, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'confirmed', '확인했음', 0
FROM public.questions WHERE question_key = 'early_termination'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 1
FROM public.questions WHERE question_key = 'early_termination'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '어떤 내용인지 모름', 2
FROM public.questions WHERE question_key = 'early_termination'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'early_termination_penalty', 'contract', 6, 4, '중도해지 시 위약금 조건은 어떻게 되나요?', '위약금 계산 방식(잔여기간 기준, 정액 등)에 따라 실제 금액이 크게 달라질 수 있습니다. 구체적인 금액 또는 산정 방식을 확인하세요.', 'text', false, 4.5, 4, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'territory_in_contract', 'contract', 6, 5, '영업지역(상권 보호)이 계약서에 명시되어 있나요?', '구두로 영업지역을 보장했더라도 계약서에 없으면 법적 효력이 없습니다. 반드시 계약서 문구를 확인하세요.', 'select', false, 4.5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes_clearly', '예, 명확하게 명시됨', 0
FROM public.questions WHERE question_key = 'territory_in_contract'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes_vague', '명시는 있으나 내용이 불명확', 1
FROM public.questions WHERE question_key = 'territory_in_contract'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없음 (보장 없음)', 2
FROM public.questions WHERE question_key = 'territory_in_contract'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 3
FROM public.questions WHERE question_key = 'territory_in_contract'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'remodeling_obligation', 'contract', 6, 6, '계약 중 인테리어 리뉴얼 의무 조항이 있나요?', '일부 계약서에는 계약 갱신 시 또는 본사 요청 시 인테리어를 재시공해야 하는 조항이 있습니다. 이 경우 추가 비용이 발생합니다.', 'select', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 있음', 0
FROM public.questions WHERE question_key = 'remodeling_obligation'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없음', 1
FROM public.questions WHERE question_key = 'remodeling_obligation'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 2
FROM public.questions WHERE question_key = 'remodeling_obligation'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '모름', 3
FROM public.questions WHERE question_key = 'remodeling_obligation'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'non_compete_clause', 'contract', 6, 7, '계약 종료 후 경업금지(유사 업종 운영 금지) 조항이 있나요?', '경업금지 조항은 계약 종료 후 일정 기간·범위 내에서 유사 사업을 할 수 없도록 제한합니다.', 'select', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 있음', 0
FROM public.questions WHERE question_key = 'non_compete_clause'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없음', 1
FROM public.questions WHERE question_key = 'non_compete_clause'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 2
FROM public.questions WHERE question_key = 'non_compete_clause'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '모름', 3
FROM public.questions WHERE question_key = 'non_compete_clause'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'transfer_restriction', 'contract', 6, 8, '가맹점을 다른 사람에게 양도(팔기)할 수 있는지 확인했나요?', '양도·양수 제한이 있으면 매장 매각이 어려워집니다. 양도 시 본사의 동의가 필요한 경우 거절될 수 있습니다.', 'select', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'free', '제한 없음', 0
FROM public.questions WHERE question_key = 'transfer_restriction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'with_approval', '본사 동의 필요', 1
FROM public.questions WHERE question_key = 'transfer_restriction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'restricted', '제한 또는 금지', 2
FROM public.questions WHERE question_key = 'transfer_restriction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 3
FROM public.questions WHERE question_key = 'transfer_restriction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'direct_store_exists', 'verification', 7, 1, '이 브랜드에 본사 직영점이 있나요?', '직영점이 있는 본사는 직접 운영을 통해 메뉴와 운영 방식을 검증했다는 의미입니다. 직영점이 없으면 운영 실현 가능성을 다른 방식으로 확인해야 합니다.', 'select', false, 3.5, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 있음', 0
FROM public.questions WHERE question_key = 'direct_store_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없음', 1
FROM public.questions WHERE question_key = 'direct_store_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 2
FROM public.questions WHERE question_key = 'direct_store_exists'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'total_store_count', 'verification', 7, 2, '현재 전국 가맹점 수(영업 중인 매장)는 몇 개인가요?', '가맹점 수가 많을수록 검증된 브랜드일 가능성이 높지만, 과포화로 경쟁이 심할 수도 있습니다. 정보공개서에서 확인할 수 있습니다.', 'text', false, 2.5, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'new_stores_last_year', 'verification', 7, 3, '최근 1년간 새로 개점한 가맹점 수는 몇 개인가요?', '신규 개점 수는 브랜드 성장성을 보여주는 지표입니다. 정보공개서에서 연도별 개점·폐점 현황을 확인할 수 있습니다.', 'text', false, 2.5, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'closed_stores_last_year', 'verification', 7, 4, '최근 1년간 폐점한 가맹점 수는 몇 개인가요?', '폐점 수가 많거나 폐점 비율이 높으면 가맹점 생존율이 낮다는 신호일 수 있습니다. 정보공개서에서 폐점 이유도 함께 확인하세요.', 'text', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'hq_financial_checked', 'verification', 7, 5, '본사의 재무 상태(손익, 부채 등)를 확인했나요?', '본사가 재정적으로 불안정하면 지원이 끊기거나 브랜드 자체가 위기에 처할 수 있습니다. 정보공개서에 본사 재무제표가 포함되어야 합니다.', 'select', false, 4, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'confirmed', '확인했음', 0
FROM public.questions WHERE question_key = 'hq_financial_checked'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 1
FROM public.questions WHERE question_key = 'hq_financial_checked'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '어떻게 확인하는지 모름', 2
FROM public.questions WHERE question_key = 'hq_financial_checked'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'supervisor_system', 'verification', 7, 6, '본사에 슈퍼바이저(가맹점 순회 지원 담당자) 제도가 있나요?', '슈퍼바이저는 오픈 후 운영에 어려움이 생겼을 때 지원해주는 역할을 합니다. 슈퍼바이저 1인당 담당 매장 수도 함께 확인하세요.', 'select', false, 3, 2, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 있음', 0
FROM public.questions WHERE question_key = 'supervisor_system'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '없음', 1
FROM public.questions WHERE question_key = 'supervisor_system'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'not_checked', '확인하지 않음', 2
FROM public.questions WHERE question_key = 'supervisor_system'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'actual_owner_contacted', 'verification', 7, 7, '이 브랜드의 실제 가맹점주와 직접 연락하거나 방문해 이야기를 나눠봤나요?', '실제 점주와의 대화는 본사 설명과 다른 현실을 알 수 있는 가장 직접적인 방법입니다. 정보공개서에서 점주 연락처를 요청할 수 있습니다.', 'select', true, 5, 4.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'yes', '예, 직접 이야기를 나눠봤음', 0
FROM public.questions WHERE question_key = 'actual_owner_contacted'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no', '아니오, 아직 하지 않음', 1
FROM public.questions WHERE question_key = 'actual_owner_contacted'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'plan', '예정이지만 아직 못함', 2
FROM public.questions WHERE question_key = 'actual_owner_contacted'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'owner_actual_sales', 'verification', 7, 8, '점주가 말한 실제 월 매출은 얼마인가요?', '실제 점주가 직접 공개한 매출은 정보공개서 수치보다 현실에 더 가깝습니다. 단, 한 매장의 수치만으로 전체를 판단하기는 어렵습니다.', 'amount', false, 5, 3.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'owner_actual_cost_rate', 'verification', 7, 9, '점주가 말한 실제 원가율은 얼마인가요?', '실제 원가율이 본사 설명보다 높으면 실제 수익이 예상보다 낮을 수 있습니다.', 'text', false, 4, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'owner_hq_support_satisfaction', 'verification', 7, 10, '점주가 본사 지원에 대해 어떻게 평가했나요?', '본사 지원 만족도는 오픈 후 운영 어려움을 극복하는 데 큰 영향을 미칩니다.', 'select', false, 4, 2.5, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'satisfied', '만족', 0
FROM public.questions WHERE question_key = 'owner_hq_support_satisfaction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'neutral', '보통', 1
FROM public.questions WHERE question_key = 'owner_hq_support_satisfaction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'dissatisfied', '불만족', 2
FROM public.questions WHERE question_key = 'owner_hq_support_satisfaction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '이야기를 나누지 못함', 3
FROM public.questions WHERE question_key = 'owner_hq_support_satisfaction'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  'owner_hq_dispute', 'verification', 7, 11, '점주가 본사와 분쟁이 있었거나 계획 대비 실제 차이가 크다고 했나요?', '분쟁 여부는 계약 리스크를 판단하는 중요한 신호입니다. 단, 한 점주의 경험만으로 전체를 판단하기 어려우므로 가능하면 여러 점주에게 확인하세요.', 'select', false, 4.5, 3, true
) ON CONFLICT (question_key) DO UPDATE SET
  category = EXCLUDED.category,
  step_number = EXCLUDED.step_number,
  order_in_step = EXCLUDED.order_in_step,
  question_text = EXCLUDED.question_text,
  description = EXCLUDED.description,
  answer_type = EXCLUDED.answer_type,
  is_required = EXCLUDED.is_required,
  risk_weight = EXCLUDED.risk_weight,
  missing_weight = EXCLUDED.missing_weight,
  is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'dispute', '예, 분쟁이 있었음', 0
FROM public.questions WHERE question_key = 'owner_hq_dispute'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'gap', '분쟁은 없지만 예상과 실제 차이가 큼', 1
FROM public.questions WHERE question_key = 'owner_hq_dispute'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'no_issue', '특별한 문제 없음', 2
FROM public.questions WHERE question_key = 'owner_hq_dispute'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, 'unknown', '이야기를 나누지 못함', 3
FROM public.questions WHERE question_key = 'owner_hq_dispute'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'partial'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'monthly_loan_payment' AND q2.question_key = 'loan_plan';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'major'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'monthly_loan_payment' AND q2.question_key = 'loan_plan';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'employee'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'expected_employee_count' AND q2.question_key = 'operation_style';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'fixed'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'hq_claimed_royalty_amount' AND q2.question_key = 'hq_claimed_royalty';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'percent'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'hq_claimed_royalty_amount' AND q2.question_key = 'hq_claimed_royalty';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'confirmed'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'material_cost_pct_value' AND q2.question_key = 'monthly_material_cost_pct';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'confirmed'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'early_termination_penalty' AND q2.question_key = 'early_termination';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'yes'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'owner_actual_sales' AND q2.question_key = 'actual_owner_contacted';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'yes'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'owner_actual_cost_rate' AND q2.question_key = 'actual_owner_contacted';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'yes'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'owner_hq_support_satisfaction' AND q2.question_key = 'actual_owner_contacted';

INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, 'yes'
FROM public.questions q1, public.questions q2
WHERE q1.question_key = 'owner_hq_dispute' AND q2.question_key = 'actual_owner_contacted';
