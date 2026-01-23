import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryPageClient from './CategoryPageClient'
import type { ProductWithDetails, Category } from '@/lib/supabase/types'

export const revalidate = 60

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_visible', true)
    .order('display_order')

  if (error) return []
  return data || []
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error) return null
  return data
}

async function getProductsByCategory(categoryId: string): Promise<ProductWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products_with_details')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_visible', true)
    .eq('status', 'published')
    .order('display_order')

  if (error) return []
  return data || []
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const [categories, category] = await Promise.all([
    getCategories(),
    getCategoryBySlug(slug),
  ])

  if (!category) {
    notFound()
  }

  const products = await getProductsByCategory(category.id)

  return (
    <CategoryPageClient
      category={category}
      categories={categories}
      products={products}
    />
  )
}
