-- Update hero_tiles slots from old 5-tile layout to new 4-tile bento grid
-- Old slots: left_top, left_bottom, center, right_top, right_middle
-- New slots: left, right_top, right_bottom_left, right_bottom_right

-- 1. Drop the old CHECK constraint
ALTER TABLE hero_tiles DROP CONSTRAINT IF EXISTS hero_tiles_slot_check;

-- 2. Clear existing rows (old slots won't match new layout)
DELETE FROM hero_tiles;

-- 3. Add the new CHECK constraint
ALTER TABLE hero_tiles ADD CONSTRAINT hero_tiles_slot_check
  CHECK (slot IN ('left', 'right_top', 'right_bottom_left', 'right_bottom_right'));

-- 4. Add url column for custom link destination (internal or external)
ALTER TABLE hero_tiles ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '/products';
