#!/bin/bash

# Supabase status 정보를 이용해 .env.local 갱신
URL=$(npx supabase status --output json | grep -o '"API URL": "[^"]*' | cut -d'"' -f4)
ANON_KEY=$(npx supabase status --output json | grep -o '"anon key": "[^"]*' | cut -d'"' -f4)
SERVICE_KEY=$(npx supabase status --output json | grep -o '"service_role key": "[^"]*' | cut -d'"' -f4)

if [ -z "$URL" ]; then
  echo "Supabase is not running. Please wait for it to start."
  exit 1
fi

cat <<EOF > .env.local
# Supabase Local Settings
NEXT_PUBLIC_SUPABASE_URL=$URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ .env.local file has been generated with local Supabase credentials."
