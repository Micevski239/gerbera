import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import SectionsClient from './SectionsClient'
import type { Category, Section } from '@/lib/supabase/types'
import type { SectionWithCategory } from '@/types/sections'

export const dynamic = 'force-dynamic'

type RawSection = Section & {
  categories: Category | null
}

async function getSections(): Promise<SectionWithCategory[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('sections')
    .select(
      `*,
      categories:category_id (
        id,
        name,
        name_mk,
        name_en,
        slug
      )
    `
    )
    .order('order', { ascending: true })

  if (error) {
    console.error('Failed to load sections', error.message)
    return []
  }

  const rawSections = (data ?? []) as RawSection[]

  return rawSections.map((section) => ({
    ...section,
    category: section.categories ?? null,
  }))
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

export default async function SectionsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const [sections, categories] = await Promise.all([getSections(), getCategories()])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Homepage Sections</h1>
        <p className="text-neutral-600 mt-2">
          Configure the product grids by assigning each section to a category and controlling the layout order.
        </p>
      </div>

      <SectionsClient sections={sections} categories={categories} />
    </div>
  )
}
