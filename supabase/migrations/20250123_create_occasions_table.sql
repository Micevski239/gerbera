-- Migration: create_occasions_table.sql
-- Description: Create occasions table for dynamic "Shop by Occasion" section

CREATE TABLE occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_mk VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(50), -- emoji character
  occasion_image_path TEXT, -- image path in Supabase storage
  description_mk TEXT,
  description_en TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;

-- Public read policy (allow anon and authenticated users to read visible occasions)
CREATE POLICY "Anyone can read visible occasions"
  ON occasions FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Admin full access for INSERT, UPDATE, DELETE (authenticated users only)
CREATE POLICY "Authenticated users can insert occasions"
  ON occasions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update occasions"
  ON occasions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete occasions"
  ON occasions FOR DELETE
  TO authenticated
  USING (true);

-- Insert default occasions
INSERT INTO occasions (name, name_mk, name_en, slug, icon, display_order, is_visible) VALUES
('Birthdays', 'Родендени', 'Birthdays', 'birthdays', '🎂', 1, true),
('Weddings', 'Свадби', 'Weddings', 'weddings', '💒', 2, true),
('Anniversaries', 'Годишнини', 'Anniversaries', 'anniversaries', '💕', 3, true),
('Name Days', 'Именден', 'Name Days', 'name-days', '⭐', 4, true),
('Baby Showers', 'Бебешки тушеви', 'Baby Showers', 'baby-showers', '👶', 5, true),
('Graduations', 'Дипломирање', 'Graduations', 'graduations', '🎓', 6, true),
('Mothers Day', 'Денот на мајката', 'Mother''s Day', 'mothers-day', '💐', 7, true),
('Fathers Day', 'Денот на таткото', 'Father''s Day', 'fathers-day', '👔', 8, true);
