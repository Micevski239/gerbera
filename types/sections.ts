import type { Category, Product, Section } from '@/lib/supabase/types'

export interface SectionWithCategory extends Section {
  category: Category | null
}

export interface SectionWithProducts extends SectionWithCategory {
  products: Product[]
}
