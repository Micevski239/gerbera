import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ShopPageClient from './ShopPageClient'
import type { Category, Product, Occasion, ProductOccasion } from '@/lib/supabase/types'

export const revalidate = 300 // Cache for 5 minutes

export const metadata: Metadata = {
  title: 'Продавница | Гербера Подароци',
  description: 'Разгледајте ја нашата колекција на рачно изработени персонализирани подароци. Филтрирајте по категорија, пригода и цена.',
}

// Extended product type with category info
interface ProductWithCategory extends Product {
  category_slug: string
  category_name: string
  category_name_mk: string
  category_name_en: string
  categories: {
    slug: string
    name: string
    name_mk: string
    name_en: string
  } | null
}

interface ProductOccasionLink extends ProductOccasion {
  occasion_slug: string
}

async function getShopData() {
  const supabase = await createClient()

  const [categoriesResult, productsResult, occasionsResult, productOccasionsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, name_mk, name_en, slug, category_image_path, description, description_mk, description_en, display_order')
      .eq('is_visible', true)
      .order('display_order'),
    supabase
      .from('products')
      .select(`
        *,
        categories (
          slug,
          name,
          name_mk,
          name_en
        )
      `)
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('display_order'),
    supabase
      .from('occasions')
      .select('id, name, name_mk, name_en, slug, icon, occasion_image_path, display_order')
      .eq('is_visible', true)
      .order('display_order'),
    supabase
      .from('product_occasions')
      .select('*'),
  ])

  // Transform products to include category info at top level
  const products = (productsResult.data || []).map((product: ProductWithCategory) => ({
    ...product,
    category_slug: product.categories?.slug || '',
    category_name: product.categories?.name || '',
    category_name_mk: product.categories?.name_mk || '',
    category_name_en: product.categories?.name_en || '',
  }))

  const occasionSlugById = new Map<string, string>()
  ;(occasionsResult.data || []).forEach((occasion) => {
    occasionSlugById.set(occasion.id, occasion.slug)
  })

  const productOccasions: ProductOccasionLink[] = (productOccasionsResult.data || [])
    .map((row) => ({
      ...row,
      occasion_slug: occasionSlugById.get(row.occasion_id) || '',
    }))
    .filter((row) => row.occasion_slug)

  return {
    categories: (categoriesResult.data || []) as Category[],
    products,
    occasions: (occasionsResult.data || []) as Occasion[],
    productOccasions,
  }
}

export default async function ShopPage() {
  const { categories, products, occasions, productOccasions } = await getShopData()

  return (
    <ShopPageClient
      categories={categories}
      products={products}
      occasions={occasions}
      productOccasions={productOccasions}
    />
  )
}
