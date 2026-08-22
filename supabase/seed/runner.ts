import { createClient } from '@supabase/supabase-js'
import { SEED_QUESTIONS } from './questions'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import ws from 'ws'

if (!global.WebSocket) {
  global.WebSocket = ws as any
}

// 루트 디렉토리의 .env.local 파일을 읽음
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // seed 시 권한 우회를 위해 service role key 사용 권장

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수 누락: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: {
    fetch: fetch,
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
})

async function runSeed() {
  console.log('🌱 질문 시드 데이터 주입 시작...')

  for (const seedQ of SEED_QUESTIONS) {
    // 1. 질문 생성
    const { data: qData, error: qError } = await supabase
      .from('questions')
      .upsert(
        {
          question_key: seedQ.question_key,
          step_number: seedQ.step_number,
          order_in_step: seedQ.order_in_step,
          question_text: seedQ.question_text,
          description: seedQ.description,
          answer_type: seedQ.answer_type,
          is_required: seedQ.is_required,
          risk_weight: seedQ.risk_weight,
          missing_weight: seedQ.missing_weight,
          is_active: seedQ.is_active ?? true,
        },
        { onConflict: 'question_key' }
      )
      .select()
      .single()

    if (qError) {
      console.error(`❌ 질문 삽입 실패 [${seedQ.question_key}]:`, qError.message)
      continue
    }

    const questionId = qData.id

    // 2. 옵션 생성 (기존 옵션 삭제 후 삽입)
    if (seedQ.options && seedQ.options.length > 0) {
      await supabase.from('question_options').delete().eq('question_id', questionId)
      
      const { error: optError } = await supabase.from('question_options').insert(
        seedQ.options.map((opt) => ({
          question_id: questionId,
          option_key: opt.option_key,
          option_text: opt.option_text,
          risk_score: opt.risk_score,
          order_index: opt.order_index,
        }))
      )
      if (optError) {
        console.error(`❌ 옵션 삽입 실패 [${seedQ.question_key}]:`, optError.message)
      }
    }

    // 3. 조건 생성 (기존 조건 삭제 후 삽입)
    if (seedQ.conditions && seedQ.conditions.length > 0) {
      await supabase.from('question_conditions').delete().eq('question_id', questionId)

      for (const cond of seedQ.conditions) {
        // 부모 질문 ID 찾기
        const { data: parentQ, error: parentError } = await supabase
          .from('questions')
          .select('id')
          .eq('question_key', cond.parent_question_key)
          .single()
        
        if (parentError || !parentQ) {
          console.error(`❌ 부모 질문 조회 실패 [${cond.parent_question_key}]:`, parentError?.message)
          continue
        }

        const { error: condError } = await supabase.from('question_conditions').insert({
          question_id: questionId,
          parent_question_id: parentQ.id,
          trigger_option_key: cond.trigger_option_key,
        })

        if (condError) {
          console.error(`❌ 조건 삽입 실패 [${seedQ.question_key}]:`, condError.message)
        }
      }
    }

    console.log(`✅ 삽입 성공: ${seedQ.question_key}`)
  }

  console.log('🎉 시드 데이터 주입 완료!')
}

runSeed()
