import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { TEST_USER_ID } from '@/lib/utils'

// GET /api/sessions — 사용자의 세션 목록
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const userId = user.id

  const { data, error } = await supabase
    .from('brand_sessions')
    .select('*, brand:brands(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ sessions: data })
}

// POST /api/sessions — 새 세션 생성
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const userId = user.id

  const body = await req.json()
  const { brand_name, hq_name, consultation_date, consultant_name } = body

  if (!brand_name || !hq_name) {
    return NextResponse.json({ error: '브랜드명과 본사명은 필수입니다.' }, { status: 400 })
  }

  // ── [무료 버전 1개 제한 및 추가 결제 확인 로직] ──
  const { count, error: countError } = await supabase
    .from('brand_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const cookieStore = req.cookies
  const hasPaid = cookieStore.get('paid_for_new_session')?.value === 'true'

  if (count !== null && count >= 1 && !hasPaid) {
    return NextResponse.json({ error: '추가 검증을 진행하려면 결제가 필요합니다.' }, { status: 403 })
  }
  // ──────────────────────────────

  // 브랜드 조회 또는 생성
  let brandId: string
  const { data: existingBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('brand_name', brand_name)
    .eq('hq_name', hq_name)
    .single()

  if (existingBrand) {
    brandId = existingBrand.id
    // 필요 시 상담일, 담당자 업데이트 로직 추가 가능
  } else {
    const { data: newBrand, error: brandError } = await supabase
      .from('brands')
      .insert({ 
        user_id: userId, 
        brand_name, 
        hq_name,
        consultation_date: consultation_date || null,
        consultant_name: consultant_name || null
      })
      .select('id')
      .single()
    if (brandError) return NextResponse.json({ error: brandError.message }, { status: 500 })
    brandId = newBrand.id
  }

  // 세션 생성
  const { data: session, error: sessionError } = await supabase
    .from('brand_sessions')
    .insert({
      user_id: userId,
      brand_id: brandId,
      status: 'in_progress',
    })
    .select()
    .single()

  if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 })

  const response = NextResponse.json({ session }, { status: 201 })
  if (hasPaid) {
    // 세션이 생성되었으므로 1회성 결제 증명 쿠키 소진
    response.cookies.delete('paid_for_new_session')
  }

  return response
}
