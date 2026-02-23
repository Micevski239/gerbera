-- Migration: make_english_fields_optional.sql
-- Description: Make all _en fields nullable across all tables
-- (Macedonian remains the primary language; English is optional)

-- announcement_lines
ALTER TABLE announcement_lines ALTER COLUMN text_en DROP NOT NULL;

-- categories
ALTER TABLE categories ALTER COLUMN name_en DROP NOT NULL;

-- products
ALTER TABLE products ALTER COLUMN name_en DROP NOT NULL;

-- sections
ALTER TABLE sections ALTER COLUMN title_en DROP NOT NULL;

-- hero_tiles
ALTER TABLE hero_tiles ALTER COLUMN label_en DROP NOT NULL;
ALTER TABLE hero_tiles ALTER COLUMN tagline_en DROP NOT NULL;

-- occasions
ALTER TABLE occasions ALTER COLUMN name_en DROP NOT NULL;

-- site_stats
ALTER TABLE site_stats ALTER COLUMN label_en DROP NOT NULL;
