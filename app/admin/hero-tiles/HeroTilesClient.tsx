'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'
import type { HeroTile } from '@/lib/supabase/types'
import { HERO_TILE_SLOTS, type HeroTileSlot } from '@/types/hero'

interface HeroTilesClientProps {
  tiles: HeroTile[]
}

interface HeroTileFormState {
  label_mk: string
  label_en: string
  tagline_mk: string
  tagline_en: string
  image_url: string
  url: string
  is_active: boolean
}

const HERO_TILE_BUCKET = 'product-images'

const slotMeta: Record<HeroTileSlot, { title: string; helper: string; order: number }> = {
  left: {
    title: 'Left (Large)',
    helper: 'Full-height card on the left side of the bento grid.',
    order: 10,
  },
  right_top: {
    title: 'Right Top',
    helper: 'Wide card at the top of the right column.',
    order: 20,
  },
  right_bottom_left: {
    title: 'Right Bottom Left',
    helper: 'Small card on the bottom-left of the right column.',
    order: 30,
  },
  right_bottom_right: {
    title: 'Right Bottom Right',
    helper: 'Small card on the bottom-right of the right column.',
    order: 40,
  },
}

export default function HeroTilesClient({ tiles }: HeroTilesClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const defaultForms = useMemo(() => {
    return HERO_TILE_SLOTS.reduce((acc, slot) => {
      const existing = tiles.find((tile) => tile.slot === slot)
      acc[slot] = {
        label_mk: existing?.label_mk ?? '',
        label_en: existing?.label_en ?? '',
        tagline_mk: existing?.tagline_mk ?? '',
        tagline_en: existing?.tagline_en ?? '',
        image_url: existing?.image_url ?? '',
        url: existing?.url ?? '/products',
        is_active: existing?.is_active ?? true,
      }
      return acc
    }, {} as Record<HeroTileSlot, HeroTileFormState>)
  }, [tiles])

  const [forms, setForms] = useState<Record<HeroTileSlot, HeroTileFormState>>(defaultForms)
  const [savingSlot, setSavingSlot] = useState<HeroTileSlot | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<HeroTileSlot | null>(null)

  useEffect(() => {
    setForms(defaultForms)
  }, [defaultForms])

  const handleFormChange = (slot: HeroTileSlot, field: keyof HeroTileFormState, value: string | boolean) => {
    setForms((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [field]: value,
      },
    }))
  }

  const handleSave = async (slot: HeroTileSlot) => {
    const form = forms[slot]
    if (!form.label_mk.trim() || !form.label_en.trim() || !form.image_url.trim()) {
      alert('Please fill out both labels and the image URL.')
      return
    }

    setSavingSlot(slot)
    try {
      const meta = slotMeta[slot]
      const payload = {
        slot,
        label_mk: form.label_mk.trim(),
        label_en: form.label_en.trim(),
        tagline_mk: form.tagline_mk.trim(),
        tagline_en: form.tagline_en.trim(),
        image_url: form.image_url.trim(),
        url: form.url.trim() || '/products',
        is_active: form.is_active,
        display_order: meta.order,
      }

      const { error } = await supabase
        .from('hero_tiles')
        .upsert(payload as never, { onConflict: 'slot' })

      if (error) {
        throw new Error(error.message)
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save hero tile. Please try again.')
    } finally {
      setSavingSlot(null)
    }
  }

  const handleReset = (slot: HeroTileSlot) => {
    setForms((prev) => ({
      ...prev,
      [slot]: defaultForms[slot],
    }))
  }

  const uploadTileImage = async (slot: HeroTileSlot, file: File) => {
    const optimized = await compressImage(file, 1600)
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
    const path = `${slot}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from(HERO_TILE_BUCKET)
      .upload(path, optimized, { cacheControl: '3600', upsert: true })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from(HERO_TILE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const handleFileSelect = async (slot: HeroTileSlot, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]

    setUploadingSlot(slot)
    try {
      const publicUrl = await uploadTileImage(slot, file)
      setForms((prev) => ({
        ...prev,
        [slot]: {
          ...prev[slot],
          image_url: publicUrl,
        },
      }))
    } catch (error) {
      console.error(error)
      alert('Failed to upload the image. Please try again.')
    } finally {
      setUploadingSlot(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Layout preview */}
      <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Layout Preview</p>
        <div className="grid grid-cols-[1fr_1fr] gap-2 h-32">
          <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500 row-span-2">
            Left (Large)
          </div>
          <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
            Right Top
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-500">
              R. Bottom Left
            </div>
            <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-500">
              R. Bottom Right
            </div>
          </div>
        </div>
      </div>

      {/* Tile forms */}
      <div className="grid gap-6 lg:grid-cols-2">
        {HERO_TILE_SLOTS.map((slot) => {
          const form = forms[slot]
          const meta = slotMeta[slot]
          return (
            <div key={slot} className="rounded-2xl bg-white shadow-card p-6 space-y-5 border border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-neutral-400">{meta.title}</p>
                  <p className="text-sm text-neutral-500">{meta.helper}</p>
                </div>
                <span className="text-xs font-semibold text-neutral-400">{slot.replace(/_/g, ' ')}</span>
              </div>

              <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-neutral-100">
                {form.image_url ? (
                  <Image
                    src={form.image_url}
                    alt={form.label_en || meta.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm bg-neutral-50">
                    No image
                  </div>
                )}
                {uploadingSlot === slot && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-semibold text-neutral-500">
                    Uploading…
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Label (MK)</label>
                  <input
                    className="input"
                    value={form.label_mk}
                    onChange={(e) => handleFormChange(slot, 'label_mk', e.target.value)}
                    placeholder="Наслов"
                  />
                </div>
                <div>
                  <label className="label">Label (EN)</label>
                  <input
                    className="input"
                    value={form.label_en}
                    onChange={(e) => handleFormChange(slot, 'label_en', e.target.value)}
                    placeholder="Label"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Tagline (MK)</label>
                  <input
                    className="input"
                    value={form.tagline_mk}
                    onChange={(e) => handleFormChange(slot, 'tagline_mk', e.target.value)}
                    placeholder="Краток опис"
                  />
                </div>
                <div>
                  <label className="label">Tagline (EN)</label>
                  <input
                    className="input"
                    value={form.tagline_en}
                    onChange={(e) => handleFormChange(slot, 'tagline_en', e.target.value)}
                    placeholder="Short description"
                  />
                </div>
              </div>

              <div>
                <label className="label">Image</label>
                <div className="flex flex-wrap gap-3">
                  <label className={`btn btn-secondary cursor-pointer ${uploadingSlot === slot ? 'opacity-70 pointer-events-none' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void handleFileSelect(slot, e.target.files)
                        e.target.value = ''
                      }}
                    />
                    {uploadingSlot === slot ? 'Uploading…' : 'Upload image'}
                  </label>
                  <input
                    className="input flex-1 min-w-[200px]"
                    value={form.image_url}
                    onChange={(e) => handleFormChange(slot, 'image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Upload a file (stored in Supabase) or paste any public image URL.
                </p>
              </div>

              <div>
                <label className="label">Link URL</label>
                <input
                  className="input"
                  value={form.url}
                  onChange={(e) => handleFormChange(slot, 'url', e.target.value)}
                  placeholder="/products or https://instagram.com/..."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Where the tile links to. Use /products for internal pages or a full URL for external (Facebook, Instagram, etc).
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-primary-600"
                  checked={form.is_active}
                  onChange={(e) => handleFormChange(slot, 'is_active', e.target.checked)}
                />
                Visible on storefront
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave(slot)}
                  disabled={savingSlot === slot}
                >
                  {savingSlot === slot ? 'Saving…' : 'Save tile'}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => handleReset(slot)}
                  disabled={savingSlot === slot}
                >
                  Reset
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
