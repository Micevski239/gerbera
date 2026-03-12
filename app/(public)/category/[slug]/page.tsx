import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryPageClient from './CategoryPageClient'
import type { ProductWithDetails, Category } from '@/lib/supabase/types'

export const revalidate = 3600

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { createBuildClient } = await import('@/lib/supabase/server')
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_visible', true)

  return (data || []).map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name, name_mk, description_mk')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (!category) {
    return { title: 'Категорија не е пронајдена | Гербера Подароци' }
  }

  const name = category.name_mk || category.name
  const description = category.description_mk || `${name} - рачно изработени персонализирани подароци од Гербера.`

  return {
    title: `${name} | Гербера Подароци`,
    description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

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
