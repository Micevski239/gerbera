-- Incremental patch for hero_tiles table
-- Run this against your existing Supabase project once

-- 1. Ensure table exists (no-op if already there)
create table if not exists hero_tiles (
  id uuid primary key default gen_random_uuid(),
  slot text not null unique check (slot in ('left_top','left_bottom','center','right_top','right_middle')),
  label_mk text not null,
  label_en text not null,
  tagline_mk text not null default '',
  tagline_en text not null default '',
  image_url text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add new columns for localized taglines (safe even if they exist)
alter table hero_tiles add column if not exists tagline_mk text not null default '';
alter table hero_tiles add column if not exists tagline_en text not null default '';

-- 3. Trigger for updated_at
drop trigger if exists update_hero_tiles_updated_at on hero_tiles;
create trigger update_hero_tiles_updated_at
before update on hero_tiles
for each row
execute function update_updated_at_column();

-- 4. RLS + grants so admin UI can read/write
alter table hero_tiles enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on hero_tiles to anon, authenticated;

drop policy if exists "Public can view hero tiles" on hero_tiles;
create policy "Public can view hero tiles"
  on hero_tiles
  for select
  to anon, authenticated
  using (is_active = true);

-- Policy assumes you use auth metadata flag `is_admin`
drop policy if exists "Admins can manage hero tiles" on hero_tiles;
create policy "Admins can manage hero tiles"
  on hero_tiles
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());
