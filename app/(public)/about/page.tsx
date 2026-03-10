import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { SiteStat } from '@/lib/supabase/types'
import AboutPageClient from './AboutPageClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'За нас | Гербера Подароци',
  description: 'Дознајте повеќе за Гербера Подароци — рачно изработени персонализирани подароци направени со љубов во Македонија.',
}

async function getStats(): Promise<SiteStat[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('site_stats')
    .select('*')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to load stats', error.message)
    return []
  }

  return data ?? []
}

export default async function AboutPage() {
  const stats = await getStats()

  return <AboutPageClient stats={stats} />
}
