-- Fix: occasions table RLS policies were missing is_admin() check
DROP POLICY IF EXISTS "Authenticated users can insert occasions" ON occasions;
DROP POLICY IF EXISTS "Authenticated users can update occasions" ON occasions;
DROP POLICY IF EXISTS "Authenticated users can delete occasions" ON occasions;

CREATE POLICY "Admins can manage occasions"
  ON occasions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fix: homepage_sections/homepage_section_items RLS (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepage_sections') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to insert homepage_sections" ON homepage_sections';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to update homepage_sections" ON homepage_sections';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to delete homepage_sections" ON homepage_sections';
    EXECUTE 'CREATE POLICY "Admins can manage homepage_sections" ON homepage_sections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepage_section_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to insert homepage_section_items" ON homepage_section_items';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to update homepage_section_items" ON homepage_section_items';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to delete homepage_section_items" ON homepage_section_items';
    EXECUTE 'CREATE POLICY "Admins can manage homepage_section_items" ON homepage_section_items FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

-- Fix: site_stats had GRANT ALL to authenticated (should be SELECT only)
REVOKE ALL ON site_stats FROM authenticated;
GRANT SELECT ON site_stats TO authenticated;

-- Fix: is_admin() function should use app_metadata instead of user_metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
