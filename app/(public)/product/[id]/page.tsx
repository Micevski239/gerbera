import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import type { Product, ProductImage, Category } from '@/lib/supabase/types'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const { createBuildClient } = await import('@/lib/supabase/server')
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('products')
    .select('id')
    .eq('is_visible', true)
    .eq('status', 'published')
    .limit(50)

  return (data || []).map((product) => ({ id: product.id }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, name_mk, description_mk, image_url')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (!product) {
    return { title: 'Производ не е пронајден | Гербера Подароци' }
  }

  const name = product.name_mk || product.name
  const description = product.description_mk || `${name} — рачно изработен персонализиран подарок од Гербера Подароци.`

  return {
    title: `${name} | Гербера Подароци`,
    description,
    openGraph: {
      title: name,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (!product) {
    notFound()
  }

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

  // JSON-LD structured data for SEO — data is from our own database, not user input
  const productName = product.name_mk || product.name
  const productDesc = product.description_mk || ''
  const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: productDesc,
    image: product.image_url || undefined,
    offers: price ? {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: 'MKD',
      availability: product.status === 'sold'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        images={imagesResult.data || []}
        category={categoryResult.data}
        relatedProducts={relatedResult.data || []}
      />
    </>
  )
}
