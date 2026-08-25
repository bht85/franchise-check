import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { preferences } = await req.json()

  // user_profiles는 trigger로 자동 생성되거나 없을 수 있으므로 upsert 사용
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, preferences },
      { onConflict: 'user_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
