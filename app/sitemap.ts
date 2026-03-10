import type { MetadataRoute } from 'next'
import { createBuildClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gerberagifts.mk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBuildClient()

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_visible', true)
      .eq('status', 'published'),
    supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_visible', true),
  ])

  const products = (productsResult.data || []).map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categories = (categoriesResult.data || []).map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categories,
    ...products,
  ]
}
