import { createClient } from '@supabase/supabase-js'

// 테스트/개발 환경에서 RLS를 우회하고 모든 권한을 갖는 admin 클라이언트
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
