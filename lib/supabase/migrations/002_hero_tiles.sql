-- Hero Tiles Table
CREATE TABLE IF NOT EXISTS hero_tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL UNIQUE CHECK (slot IN ('left_top', 'left_bottom', 'center', 'right_top', 'right_middle')),
  label_mk TEXT NOT NULL,
  label_en TEXT NOT NULL,
  tagline_mk TEXT NOT NULL DEFAULT '',
  tagline_en TEXT NOT NULL DEFAULT '',
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

-- Enable RLS
ALTER TABLE hero_tiles ENABLE ROW LEVEL SECURITY;

-- Policies
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
