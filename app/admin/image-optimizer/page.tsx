import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import ImageOptimizerClient from './ImageOptimizerClient'

export const dynamic = 'force-dynamic'

export interface ImageRecord {
  id: string
  table: string
  imageField: string
  imageValue: string
  label: string
}

export default async function ImageOptimizerPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/admin/login')

  const supabase = await createServerSupabaseClient()

  const [productsRes, categoriesRes, occasionsRes, heroTilesRes] = await Promise.all([
    supabase.from('products').select('id, name_en, name_mk, image_url'),
    supabase.from('categories').select('id, name_en, name_mk, category_image_path'),
    supabase.from('occasions').select('id, name_en, name_mk, occasion_image_path'),
    supabase.from('hero_tiles').select('id, slot, image_url'),
  ])

  const images: ImageRecord[] = []

  ;(productsRes.data ?? []).forEach((p) => {
    if (p.image_url) {
      images.push({
        id: p.id,
        table: 'products',
        imageField: 'image_url',
        imageValue: p.image_url,
        label: `Производ: ${p.name_mk || p.name_en}`,
      })
    }
  })

  ;(categoriesRes.data ?? []).forEach((c) => {
    if (c.category_image_path) {
      images.push({
        id: c.id,
        table: 'categories',
        imageField: 'category_image_path',
        imageValue: c.category_image_path,
        label: `Категорија: ${c.name_mk || c.name_en}`,
      })
    }
  })

  ;(occasionsRes.data ?? []).forEach((o) => {
    if (o.occasion_image_path) {
      images.push({
        id: o.id,
        table: 'occasions',
        imageField: 'occasion_image_path',
        imageValue: o.occasion_image_path,
        label: `Пригода: ${o.name_mk || o.name_en}`,
      })
    }
  })

  ;(heroTilesRes.data ?? []).forEach((h) => {
    if (h.image_url) {
      images.push({
        id: h.id,
        table: 'hero_tiles',
        imageField: 'image_url',
        imageValue: h.image_url,
        label: `Хиро плочка: ${h.slot}`,
      })
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Оптимизатор на слики</h1>
        <p className="text-neutral-600 mt-2">
          Репроцесирање на сите слики во WebP формат со миниатури.
        </p>
      </div>
      <ImageOptimizerClient images={images} />
    </div>
  )
}
