import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import OccasionsClient from './OccasionsClient'
import type { Occasion } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

async function getOccasions(): Promise<Occasion[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to load occasions', error.message)
    return []
  }

  return data ?? []
}

export default async function OccasionsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const occasions = await getOccasions()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Occasions</h1>
        <p className="text-neutral-600 mt-2">Manage occasions for the "Shop by Occasion" section on the homepage.</p>
      </div>

      <OccasionsClient occasions={occasions} />
    </div>
  )
}
