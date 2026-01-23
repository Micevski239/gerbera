import { createClient } from '@/lib/supabase/server'
import ShopPageClient from './ShopPageClient'
import type { Category, Product } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

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

async function getShopData() {
  const supabase = await createClient()

  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
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
  ])

  // Transform products to include category info at top level
  const products = (productsResult.data || []).map((product: ProductWithCategory) => ({
    ...product,
    category_slug: product.categories?.slug || '',
    category_name: product.categories?.name || '',
    category_name_mk: product.categories?.name_mk || '',
    category_name_en: product.categories?.name_en || '',
  }))

  return {
    categories: (categoriesResult.data || []) as Category[],
    products,
  }
}

export default async function ShopPage() {
  const { categories, products } = await getShopData()

  return <ShopPageClient categories={categories} products={products} />
}
