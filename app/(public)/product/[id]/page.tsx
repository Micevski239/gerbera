import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import type { Product, ProductImage, Category, ProductWithDetails } from '@/lib/supabase/types'

export const revalidate = 60

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (error) return null
  return data
}

async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('is_primary', { ascending: false })
    .order('display_order')

  if (error) return []
  return data || []
}

async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

async function getRelatedProducts(categoryId: string, currentProductId: string): Promise<ProductWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products_with_details')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_visible', true)
    .eq('status', 'published')
    .neq('id', currentProductId)
    .order('display_order')
    .limit(4)

  if (error) return []
  return data || []
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const [images, category, relatedProducts] = await Promise.all([
    getProductImages(product.id),
    getCategory(product.category_id),
    getRelatedProducts(product.category_id, product.id),
  ])

  return (
    <ProductDetailClient
      product={product}
      images={images}
      category={category}
      relatedProducts={relatedProducts}
    />
  )
}
