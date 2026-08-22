const fs = require('fs');

const files = [
  'src/app/api/sessions/route.ts',
  'src/app/api/answers/route.ts',
  'src/app/api/documents/route.ts',
  'src/app/api/documents/analyze/route.ts',
  'src/app/api/risk/calculate/route.ts',
  'src/app/dashboard/page.tsx',
  'src/app/session/[sessionId]/survey/page.tsx',
  'src/app/session/[sessionId]/upload/page.tsx',
  'src/app/session/[sessionId]/report/page.tsx',
  'src/proxy.ts'
];

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let text = fs.readFileSync(f, 'utf8');
  
  if (f === 'src/proxy.ts') {
    text = text.replace(
      `    const { data: { user } } = await supabase.auth.getUser()

  // 테스트 모드: 모든 라우트 접근 허용 (로그인 비활성화)
  return supabaseResponse`,
      `  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const isPublicRoute = pathname === '/' || pathname.startsWith('/report/') || isAuthRoute

  // 인증되지 않은 사용자가 보호된 라우트 접근 시
  if (!user && !isPublicRoute && !pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect_to', pathname)
    return NextResponse.redirect(url)
  }

  // 인증된 사용자가 로그인 페이지 접근 시
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse`
    );
  } else {
    text = text.replace(/import \{ createSupabaseAdminClient \} from '@\/lib\/supabase\/admin'/g, "import { createSupabaseServerClient } from '@/lib/supabase/server'");
    text = text.replace(/const supabase = createSupabaseAdminClient\(\)/g, "const supabase = await createSupabaseServerClient()\n  const { data: { user } } = await supabase.auth.getUser()");
    
    if (f.includes('page.tsx')) {
       text = text.replace(/const userId = TEST_USER_ID/g, "if (!user) redirect('/login')\n  const userId = user.id");
    } else {
       text = text.replace(/const userId = TEST_USER_ID/g, "if (!user) return new Response('Unauthorized', { status: 401 })\n  const userId = user.id");
    }
  }

  fs.writeFileSync(f, text);
});
console.log('Reverted');
