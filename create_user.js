const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
global.WebSocket = require('ws');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test@test.com',
    password: 'testpassword123',
    email_confirm: true
  });
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('User created:', data.user.id);
  }
}
main();
