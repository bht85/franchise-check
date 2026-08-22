DROP POLICY IF EXISTS "brands_own" ON brands;
CREATE POLICY "brands_all_auth" ON brands
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
