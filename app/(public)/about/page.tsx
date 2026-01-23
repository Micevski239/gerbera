import { createClient } from '@/lib/supabase/server'
import AboutPageClient from './AboutPageClient'
import type { AboutContent, AboutStat, AboutGalleryImage, Testimonial } from '@/lib/supabase/types'

export const revalidate = 3600

export default async function AboutPage() {
  const supabase = await createClient()

  const [contentResult, statsResult, galleryResult, testimonialsResult] = await Promise.all([
    supabase.from('about_content').select('*'),
    supabase.from('about_stats').select('*').order('display_order'),
    supabase.from('about_gallery').select('*').order('display_order'),
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  // Build content map from results
  const contentData = (contentResult.data || []) as AboutContent[]
  const contentMap = new Map<string, AboutContent>()
  contentData.forEach(item => {
    if (item.section_key) {
      contentMap.set(item.section_key, item)
    }
  })

  return (
    <AboutPageClient
      mainContent={contentMap.get('main') || null}
      quoteContent={contentMap.get('quote') || null}
      stats={(statsResult.data || []) as AboutStat[]}
      gallery={(galleryResult.data || []) as AboutGalleryImage[]}
      testimonials={(testimonialsResult.data || []) as Testimonial[]}
    />
  )
}
