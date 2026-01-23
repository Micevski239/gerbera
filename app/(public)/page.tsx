import { createClient } from '@/lib/supabase/server'
import HomePageClient from './HomePageClient'
import type { Category, Product, Occasion } from '@/lib/supabase/types'

export const revalidate = 60

async function getHomepageData() {
  const supabase = await createClient()

  const [categoriesResult, latestProductsResult, popularProductsResult, bestSellersResult, occasionsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, name_en, name_mk, slug, category_image_path, description, description_mk, description_en')
      .eq('is_visible', true)
      .order('display_order'),
    supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .limit(8),
    supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .eq('status', 'published')
      .eq('is_best_seller', true)
      .order('display_order', { ascending: true })
      .limit(8),
    supabase
      .from('occasions')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true }),
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

  const categories = (categoriesResult.data || []) as Category[]
  const occasions = (occasionsResult.data || []) as Occasion[]

  return {
    categories,
    occasions,
    productHighlights: {
      latest: (latestProductsResult.data || []) as Product[],
      popular: (popularProductsResult.data || []) as Product[],
      best: (bestSellersResult.data || []) as Product[],
    },
  }
}

export default async function HomePage() {
  const { categories, occasions, productHighlights } = await getHomepageData()

  return (
    <HomePageClient
      categories={categories}
      occasions={occasions}
      productHighlights={productHighlights}
    />
  )
}
