-- =====================================================
-- GERBERA GIFTS - ANNOUNCEMENTS-ONLY SUPABASE SCHEMA
-- =====================================================
-- Run this script on a fresh Supabase project (or to reset an
-- existing one) when you only need the rotating announcement bar.
-- It removes every previous table/view and recreates the single
-- `announcement_lines` table with the proper RLS policies.

-- =====================================================
-- 1. CLEAN UP OLD STRUCTURES
-- =====================================================
DROP VIEW IF EXISTS products_with_details CASCADE;
DROP VIEW IF EXISTS homepage_sections_with_items CASCADE;

DROP TABLE IF EXISTS homepage_section_items CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS about_gallery CASCADE;
DROP TABLE IF EXISTS about_content CASCADE;
DROP TABLE IF EXISTS about_stats CASCADE;
DROP TABLE IF EXISTS welcome_tiles CASCADE;
DROP TABLE IF EXISTS homepage_grid_images CASCADE;
DROP TABLE IF EXISTS homepage_hero_slides CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS announcement_lines CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- =====================================================
-- 2. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 3. HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() IS NOT NULL
    AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ANNOUNCEMENT LINES TABLE
-- =====================================================
CREATE TABLE announcement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_mk TEXT NOT NULL,
  text_en TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_announcement_lines_updated_at
BEFORE UPDATE ON announcement_lines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY & POLICIES
-- =====================================================
ALTER TABLE announcement_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active announcements"
ON announcement_lines
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage announcements"
ON announcement_lines
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- 6. INDEXES & SAMPLE DATA
-- =====================================================
CREATE INDEX idx_announcement_lines_active_order
ON announcement_lines(is_active, display_order);

INSERT INTO announcement_lines (text_mk, text_en, display_order)
VALUES
  ('Персонализирани подароци за секоја прослава', 'Personalized gifts for every celebration', 0),
  ('Нови балони со посвети секоја недела', 'Fresh custom balloons every week', 10)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. CATEGORIES TABLE (REQUIRED BY SECTIONS & PRODUCTS)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_mk TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_mk TEXT,
  description_en TEXT,
  category_image_path TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible categories"
ON categories
FOR SELECT
TO anon, authenticated
USING (is_visible = true);

CREATE POLICY "Admins can manage categories"
ON categories
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_categories_visible_order
ON categories (is_visible, display_order);

-- =====================================================
-- 8. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_mk TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_mk TEXT,
  description_en TEXT,
  image_url TEXT NOT NULL,
  price_text TEXT,
  price NUMERIC(12,2),
  sale_price NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold')),
  is_on_sale BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
ON products
FOR SELECT
TO anon, authenticated
USING (
  is_visible = true
  AND status = 'published'
  AND EXISTS (
    SELECT 1 FROM categories c
    WHERE c.id = products.category_id
      AND c.is_visible = true
  )
);

CREATE POLICY "Admins can manage products"
ON products
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_products_category_order
ON products (category_id, display_order);

CREATE INDEX IF NOT EXISTS idx_products_active
ON products (is_visible);

-- =====================================================
-- 9. DYNAMIC SECTIONS TABLE
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'section_shape'
  ) THEN
    CREATE TYPE section_shape AS ENUM ('circle', 'square');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mk TEXT NOT NULL,
  title_en TEXT,
  shape section_shape NOT NULL DEFAULT 'square',
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  product_limit INTEGER NOT NULL DEFAULT 8,
  "order" INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active sections"
ON sections
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage sections"
ON sections
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_sections_active_order
ON sections (is_active, "order");

CREATE INDEX IF NOT EXISTS idx_sections_category
ON sections (category_id);

CREATE TABLE IF NOT EXISTS hero_tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL UNIQUE CHECK (slot IN ('left_top', 'left_bottom', 'center', 'right_top', 'right_middle')),
  label_mk TEXT NOT NULL,
  label_en TEXT,
  tagline_mk TEXT NOT NULL DEFAULT '',
  tagline_en TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_hero_tiles_updated_at
BEFORE UPDATE ON hero_tiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE hero_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hero tiles"
ON hero_tiles
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage hero tiles"
ON hero_tiles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
