-- 1. Enable RLS on core tables
ALTER TABLE brand_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing wide-open policies if any exist
DROP POLICY IF EXISTS "Users can only access their own sessions" ON brand_sessions;
DROP POLICY IF EXISTS "Users can only access answers for their sessions" ON question_answers;
DROP POLICY IF EXISTS "Users can access their own reports" ON reports;
DROP POLICY IF EXISTS "Anyone can read report with share_token" ON reports;
DROP POLICY IF EXISTS "Users can manage documents for their sessions" ON documents;

-- 3. brand_sessions: User can only see/edit their own sessions
CREATE POLICY "Users can manage their own sessions" 
ON brand_sessions 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 4. question_answers: User can only manage answers tied to their own sessions
CREATE POLICY "Users can manage answers for their sessions" 
ON question_answers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM brand_sessions 
    WHERE brand_sessions.id = question_answers.session_id 
    AND brand_sessions.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brand_sessions 
    WHERE brand_sessions.id = question_answers.session_id 
    AND brand_sessions.user_id = auth.uid()
  )
);

-- 5. reports: User can manage their own reports
CREATE POLICY "Users can manage their own reports" 
ON reports 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM brand_sessions 
    WHERE brand_sessions.id = reports.session_id 
    AND brand_sessions.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brand_sessions 
    WHERE brand_sessions.id = reports.session_id 
    AND brand_sessions.user_id = auth.uid()
  )
);

-- 6. documents: User can manage documents tied to their sessions
CREATE POLICY "Users can manage documents for their sessions" 
ON documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM brand_sessions 
    WHERE brand_sessions.id = documents.session_id 
    AND brand_sessions.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brand_sessions 
    WHERE brand_sessions.id = documents.session_id 
    AND brand_sessions.user_id = auth.uid()
  )
);
