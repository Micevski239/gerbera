-- Migration: create_site_stats_table.sql
-- Description: Create site_stats table for dynamic homepage statistics

CREATE TABLE site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_mk VARCHAR(255) NOT NULL,
  label_en VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  suffix_mk VARCHAR(50),
  suffix_en VARCHAR(50),
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Grant table access
GRANT SELECT ON site_stats TO anon;
GRANT ALL ON site_stats TO authenticated;

-- Public read policy
CREATE POLICY "Anyone can read visible stats"
  ON site_stats FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Admin full access
CREATE POLICY "Admins can manage stats"
  ON site_stats
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert default stats
INSERT INTO site_stats (label_mk, label_en, value, suffix_mk, suffix_en, icon, display_order, is_visible) VALUES
('Години искуство', 'Years Experience', '5', 'години', 'years', 'calendar', 1, true),
('Задоволни клиенти', 'Happy Customers', '500', '+', '+', 'users', 2, true),
('Производи', 'Products', '200', '+', '+', 'box', 3, true),
('Рачна изработка', 'Handcrafted', '100', '%', '%', 'heart', 4, true);
