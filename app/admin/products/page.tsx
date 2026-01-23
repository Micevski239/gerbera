import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'
import type { Category, Product } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

async function getProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to load products', error.message)
    return []
  }

  return data ?? []
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Failed to load categories', error.message)
    return []
  }

  return data ?? []
}

export default async function ProductsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Products</h1>
        <p className="text-neutral-600 mt-2">Create and maintain the products displayed across the storefront.</p>
      </div>

      <ProductsClient products={products} categories={categories} />
    </div>
  )
}
