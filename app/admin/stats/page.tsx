import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import StatsClient from './StatsClient'
import type { SiteStat } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

async function getStats(): Promise<SiteStat[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('site_stats')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to load stats', error.message)
    return []
  }

  return data ?? []
}

export default async function StatsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Site Statistics</h1>
        <p className="text-neutral-600 mt-2">Manage the statistics displayed in the About section on the homepage.</p>
      </div>

      <StatsClient stats={stats} />
    </div>
  )
}
