import { createClient } from '@/lib/supabase/server'
import HomePageClient from './HomePageClient'
import type { Category, Product, Occasion, SiteStat, HeroTile, Testimonial } from '@/lib/supabase/types'

export const revalidate = 3600 // Cache for 1 hour

async function getHomepageData() {
  const supabase = await createClient()

  const [categoriesResult, latestProductsResult, popularProductsResult, bestSellersResult, occasionsResult, statsResult, heroTilesResult, testimonialsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, name_en, name_mk, slug, category_image_path, description, description_mk, description_en')
      .eq('is_visible', true)
      .order('display_order'),
    supabase
      .from('products')
      .select('id, name, name_mk, name_en, image_url, price, sale_price, price_text, is_on_sale, is_best_seller, status, category_id, display_order, created_at')
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('id, name, name_mk, name_en, image_url, price, sale_price, price_text, is_on_sale, is_best_seller, status, category_id, display_order, created_at')
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .limit(8),
    supabase
      .from('products')
      .select('id, name, name_mk, name_en, image_url, price, sale_price, price_text, is_on_sale, is_best_seller, status, category_id, display_order, created_at')
      .eq('is_visible', true)
      .eq('status', 'published')
      .eq('is_best_seller', true)
      .order('display_order', { ascending: true })
      .limit(8),
    supabase
      .from('occasions')
      .select('id, name, name_mk, name_en, slug, icon, occasion_image_path, display_order')
      .eq('is_visible', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('site_stats')
      .select('id, label_mk, label_en, value, suffix_mk, suffix_en, icon, display_order')
      .eq('is_visible', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('hero_tiles')
      .select('id, slot, label_mk, label_en, tagline_mk, tagline_en, image_url, url, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (categoriesResult.error) {
    console.error('Failed to load categories', categoriesResult.error.message)
  }
  if (latestProductsResult.error) {
    console.error('Failed to load latest products', latestProductsResult.error.message)
  }
  if (popularProductsResult.error) {
    console.error('Failed to load popular products', popularProductsResult.error.message)
  }
  if (bestSellersResult.error) {
    console.error('Failed to load best sellers', bestSellersResult.error.message)
  }
  if (occasionsResult.error) {
    console.error('Failed to load occasions', occasionsResult.error.message)
  }
  if (statsResult.error) {
    console.error('Failed to load stats', statsResult.error.message)
  }
  if (heroTilesResult.error) {
    console.error('Failed to load hero tiles', heroTilesResult.error.message)
  }
  if (testimonialsResult.error) {
    console.error('Failed to load testimonials', testimonialsResult.error.message)
  }

  const categories = (categoriesResult.data || []) as Category[]
  const occasions = (occasionsResult.data || []) as Occasion[]
  const stats = (statsResult.data || []) as SiteStat[]
  const heroTiles = (heroTilesResult.data || []) as HeroTile[]
  const testimonials = (testimonialsResult.data || []) as Testimonial[]

  return {
    categories,
    occasions,
    stats,
    heroTiles,
    testimonials,
    productHighlights: {
      latest: (latestProductsResult.data || []) as Product[],
      popular: (popularProductsResult.data || []) as Product[],
      best: (bestSellersResult.data || []) as Product[],
    },
  }
}

export default async function HomePage() {
  const { categories, occasions, stats, productHighlights, heroTiles, testimonials } = await getHomepageData()

  return (
    <HomePageClient
      categories={categories}
      occasions={occasions}
      stats={stats}
      productHighlights={productHighlights}
      heroTiles={heroTiles}
      testimonials={testimonials}
    />
  )
}
