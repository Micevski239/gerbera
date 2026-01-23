import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryPageClient from './CategoryPageClient'
import type { ProductWithDetails, Category } from '@/lib/supabase/types'

export const revalidate = 3600

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Run all queries in parallel with single client
  const [categoriesResult, categoryResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .order('display_order'),
    supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_visible', true)
      .single(),
  ])

  const categories = categoriesResult.data || []
  const category = categoryResult.data

  if (!category) {
    notFound()
  }

  // Get products for this category
  const { data: products } = await supabase
    .from('products_with_details')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_visible', true)
    .eq('status', 'published')
    .order('display_order')

  return (
    <CategoryPageClient
      category={category}
      categories={categories}
      products={products || []}
    />
  )
}
