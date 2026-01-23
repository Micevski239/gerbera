import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import type { HeroTile } from '@/lib/supabase/types'
import HeroTilesClient from './HeroTilesClient'

export const dynamic = 'force-dynamic'

async function getHeroTiles(): Promise<HeroTile[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('hero_tiles')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to load hero tiles', error.message)
    return []
  }

  return data ?? []
}

export default async function HeroTilesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const tiles = await getHeroTiles()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Hero Tiles</h1>
        <p className="text-neutral-600 mt-2">
          Manage the five hero tiles on the storefront (two left, featured center, two right).
        </p>
      </div>

      <HeroTilesClient tiles={tiles} />
    </div>
  )
}
