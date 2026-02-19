import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/supabase/types'

export const revalidate = 3600

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, name_en, name_mk, slug, category_image_path, description, description_mk, description_en')
    .eq('is_visible', true)
    .order('display_order')

  const categories = (data || []) as Category[]

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
