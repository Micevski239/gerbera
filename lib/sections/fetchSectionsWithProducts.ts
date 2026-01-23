import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Category, Product } from '@/lib/supabase/types'
import type { SectionWithProducts } from '@/types/sections'

type SectionRow = Database['public']['Tables']['sections']['Row']

interface RawSection extends SectionRow {
  categories: Category | null
}

export async function fetchSectionsWithProducts(
  supabase: SupabaseClient<Database>
): Promise<SectionWithProducts[]> {
  const { data: sectionData, error: sectionError } = await supabase
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
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (sectionError) {
    throw new Error(sectionError.message)
  }

  const rawSections = (sectionData ?? []) as unknown as RawSection[]

  if (rawSections.length === 0) {
    return []
  }

  const categoryIds = Array.from(
    new Set(rawSections.map((section) => section.category_id).filter(Boolean))
  ) as string[]

  let productMap = new Map<string, Product[]>()

  if (categoryIds.length > 0) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('category_id', categoryIds)
      .eq('is_visible', true)
      .eq('status', 'published')
      .order('display_order', { ascending: true })

    if (productError) {
      throw new Error(productError.message)
    }

    productMap = (productData ?? []).reduce((map, product) => {
      const list = map.get(product.category_id) ?? []
      list.push(product)
      map.set(product.category_id, list)
      return map
    }, new Map<string, Product[]>())
  }

  return rawSections.map((section) => ({
    ...section,
    category: section.categories ?? null,
    products: (productMap.get(section.category_id) ?? []).slice(0, section.product_limit),
  }))
}
