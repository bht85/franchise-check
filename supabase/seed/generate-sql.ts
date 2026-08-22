import { SEED_QUESTIONS } from './questions'
import * as fs from 'fs'

let sql = ''

for (const q of SEED_QUESTIONS) {
  const active = q.is_active === false ? 'false' : 'true'
  sql += `
INSERT INTO public.questions (
  question_key, category, step_number, order_in_step, question_text, description, answer_type, is_required, risk_weight, missing_weight, is_active
) VALUES (
  '${q.question_key}', '${q.category}', ${q.step_number}, ${q.order_in_step}, '${q.question_text.replace(/'/g, "''")}', ${q.description ? `'${q.description.replace(/'/g, "''")}'` : 'NULL'}, '${q.answer_type}', ${q.is_required}, ${q.risk_weight}, ${q.missing_weight}, ${active}
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
`

  if (q.options) {
    for (const opt of q.options) {
      sql += `
INSERT INTO public.question_options (
  question_id, option_key, option_text, order_index
) 
SELECT id, '${opt.option_key}', '${opt.option_text.replace(/'/g, "''")}', ${opt.order_index}
FROM public.questions WHERE question_key = '${q.question_key}'
ON CONFLICT (question_id, option_key) DO UPDATE SET
  option_text = EXCLUDED.option_text,
  order_index = EXCLUDED.order_index;
`
    }
  }
}

// 부모 조건 쿼리는 질문 생성 후에 실행
for (const q of SEED_QUESTIONS) {
  if (q.conditions) {
    for (const cond of q.conditions) {
      const trigger = cond.trigger_option_key ? `'${cond.trigger_option_key}'` : 'NULL'
      sql += `
INSERT INTO public.question_conditions (
  question_id, parent_question_id, trigger_option_key
)
SELECT q1.id, q2.id, ${trigger}
FROM public.questions q1, public.questions q2
WHERE q1.question_key = '${q.question_key}' AND q2.question_key = '${cond.parent_question_key}';
`
    }
  }
}

fs.writeFileSync('supabase/seed.sql', sql)
console.log('supabase/seed.sql generated.')
