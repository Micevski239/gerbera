import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import type { Product, ProductImage, Category } from '@/lib/supabase/types'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // First get the product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (!product) {
    notFound()
  }

  // Then run remaining queries in parallel with single client
  const [imagesResult, categoryResult, relatedResult] = await Promise.all([
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('is_primary', { ascending: false })
      .order('display_order'),
    supabase
      .from('categories')
      .select('*')
      .eq('id', product.category_id)
      .single(),
    supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .eq('is_visible', true)
      .eq('status', 'published')
      .neq('id', product.id)
      .order('display_order')
      .limit(8),
  ])

  return (
    <ProductDetailClient
      product={product}
      images={imagesResult.data || []}
      category={categoryResult.data}
      relatedProducts={relatedResult.data || []}
    />
  )
}
