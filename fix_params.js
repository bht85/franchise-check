const fs = require('fs');

const files = [
  'src/app/session/[sessionId]/survey/page.tsx',
  'src/app/session/[sessionId]/upload/page.tsx',
  'src/app/session/[sessionId]/report/page.tsx',
  'src/app/report/[shareToken]/page.tsx'
];

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let text = fs.readFileSync(f, 'utf8');
  
  // interface Props의 params 수정 (필요하다면 Promise로)
  text = text.replace(
    /interface Props \{\n  params: \{ [a-zA-Z]+: string \}\n\}/,
    match => match.replace('params: {', 'params: Promise<{').replace('}', '}>')
  );

  text = text.replace(
    /const \{ sessionId \} = params/g,
    "const { sessionId } = await params"
  );
  
  text = text.replace(
    /const \{ shareToken \} = params/g,
    "const { shareToken } = await params"
  );

  fs.writeFileSync(f, text);
});
console.log('Fixed Next.js 15+ params Promise');
