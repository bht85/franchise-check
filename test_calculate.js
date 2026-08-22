const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  await supabase.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'testpassword123'
  });

  const { data: { session } } = await supabase.auth.getSession();
  
  const res = await fetch('http://localhost:3001/api/risk/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token=${JSON.stringify(session)}`
    },
    body: JSON.stringify({ session_id: 'e7644620-efe0-4c68-8c59-d2d1ba9b9c7d' })
  });

  const text = await res.text();
  console.log(res.status, text);
}
main();
