import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import AnnouncementLinesClient from './AnnouncementLinesClient'
import type { AnnouncementLine } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

async function getAnnouncementLines(): Promise<AnnouncementLine[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('announcement_lines')
    .select('*')
    .order('display_order')

  if (error) {
    console.error('Failed to load announcement lines', error.message)
    return []
  }

  return data || []
}

export default async function AnnouncementLinesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const announcements = await getAnnouncementLines()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Top Bar Announcements</h1>
        <p className="text-neutral-600 mt-2">
          Manage the short promo lines that rotate in the website top bar.
        </p>
      </div>

      <AnnouncementLinesClient announcements={announcements} />
    </div>
  )
}
