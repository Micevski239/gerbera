-- Homepage Sections Migration
-- Creates tables for the flexible homepage section system

-- Main sections table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL, -- 'product_grid', 'category_grid', 'banner', 'text_image', 'trust_badges', 'gallery'
  title_mk TEXT,
  title_en TEXT,
  subtitle_mk TEXT,
  subtitle_en TEXT,

  -- Layout Configuration
  layout_style TEXT NOT NULL DEFAULT 'grid-4', -- 'grid-2', 'grid-3', 'grid-4', 'grid-5', 'grid-6', 'carousel', 'masonry'
  item_shape TEXT DEFAULT 'square', -- 'square', 'circle', 'rectangle', 'card'

  -- Content Configuration (JSON for flexibility)
  config JSONB DEFAULT '{}',
  -- Examples:
  -- For product_grid: {"filter": "best_seller", "limit": 8, "show_price": true, "show_rating": true, "show_badge": true, "show_add_to_cart": false}
  -- For category_grid: {"category_type": "occasion"}
  -- For banner: {"image_path": "...", "link": "...", "height": "medium", "text_position": "center", "overlay_opacity": 50, "cta_text_mk": "...", "cta_text_en": "...", "cta_link": "..."}
  -- For text_image: {"image_position": "left", "image_path": "...", "content_mk": "...", "content_en": "...", "cta_text_mk": "...", "cta_text_en": "...", "cta_link": "..."}
  -- For gallery: {"columns": 6}

  -- Display Settings
  background_color TEXT DEFAULT '#FFFFFF',
  background_style TEXT DEFAULT 'solid', -- 'solid', 'gradient', 'image'
  padding_size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'

  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section items table (for custom items in category grids, trust badges, gallery images)
CREATE TABLE IF NOT EXISTS homepage_section_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,

  -- Content
  title_mk TEXT,
  title_en TEXT,
  subtitle_mk TEXT,
  subtitle_en TEXT,
  image_path TEXT,
  link TEXT,
  icon TEXT, -- for trust badges: 'truck', 'shield', 'clock', 'heart', 'check', 'star', 'refresh', 'lock'

  -- Styling
  background_color TEXT,
  text_color TEXT,

  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_homepage_sections_display_order ON homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_is_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_section_items_section_id ON homepage_section_items(section_id);
CREATE INDEX IF NOT EXISTS idx_homepage_section_items_display_order ON homepage_section_items(display_order);

-- Create a view that joins sections with their items
CREATE OR REPLACE VIEW homepage_sections_with_items AS
SELECT
  s.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', i.id,
        'title_mk', i.title_mk,
        'title_en', i.title_en,
        'subtitle_mk', i.subtitle_mk,
        'subtitle_en', i.subtitle_en,
        'image_path', i.image_path,
        'link', i.link,
        'icon', i.icon,
        'background_color', i.background_color,
        'text_color', i.text_color,
        'display_order', i.display_order,
        'is_active', i.is_active
      ) ORDER BY i.display_order
    ) FILTER (WHERE i.id IS NOT NULL AND i.is_active = true),
    '[]'::json
  ) AS items
FROM homepage_sections s
LEFT JOIN homepage_section_items i ON s.id = i.section_id
GROUP BY s.id;

-- Enable RLS (Row Level Security)
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_section_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on homepage_sections"
  ON homepage_sections FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on homepage_section_items"
  ON homepage_section_items FOR SELECT
  USING (true);

-- Create policies for authenticated users (admin) to manage sections
CREATE POLICY "Allow authenticated users to insert homepage_sections"
  ON homepage_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update homepage_sections"
  ON homepage_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete homepage_sections"
  ON homepage_sections FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert homepage_section_items"
  ON homepage_section_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update homepage_section_items"
  ON homepage_section_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete homepage_section_items"
  ON homepage_section_items FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_section_items_updated_at ON homepage_section_items;
CREATE TRIGGER update_homepage_section_items_updated_at
  BEFORE UPDATE ON homepage_section_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
