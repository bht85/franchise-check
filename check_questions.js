const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: user } = await supabase.auth.admin.getUserById('4c33c391-3860-4b0f-956a-330bf045e6b8');
  
  // 클라이언트인 척 하기
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // 직접 JWT가 없으니 그냥 로그인 시키자
  await client.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'testpassword123'
  });

  const { data, error } = await client
    .from('questions')
    .select('*, options:question_options(*), conditions:question_conditions(*)')
    .eq('is_active', true)
    .order('step_number')
    .order('order_in_step');

  console.log('Error:', error);
  console.log('Data count:', data ? data.length : 0);
  if (data && data.length > 0) {
     console.log('First question:', data[0]);
  }
}
main();
