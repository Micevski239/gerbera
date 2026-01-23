import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import CategoriesClient from './CategoriesClient'
import type { Category } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

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

export default async function CategoriesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const categories = await getCategories()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Categories</h1>
        <p className="text-neutral-600 mt-2">Manage the category list that powers products and homepage sections.</p>
      </div>

      <CategoriesClient categories={categories} />
    </div>
  )
}
