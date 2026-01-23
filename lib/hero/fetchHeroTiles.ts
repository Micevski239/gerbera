import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, HeroTile } from '@/lib/supabase/types'

export async function fetchHeroTiles(
  supabase: SupabaseClient<Database>
): Promise<HeroTile[]> {
  const { data, error } = await supabase
    .from('hero_tiles')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as HeroTile[]
}
