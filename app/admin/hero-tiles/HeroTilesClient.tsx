'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { processImage, isImageFile, sanitizeFilename } from '@/lib/utils'
import type { HeroTile } from '@/lib/supabase/types'
import { HERO_TILE_SLOTS, type HeroTileSlot } from '@/types/hero'

interface HeroTilesClientProps {
  tiles: HeroTile[]
}

interface HeroTileFormState {
  label_mk: string
  tagline_mk: string
  image_url: string
  url: string
  is_active: boolean
}

const HERO_TILE_BUCKET = 'product-images'

const slotMeta: Record<HeroTileSlot, { title: string; helper: string; order: number }> = {
  left: {
    title: 'Лево (Голема)',
    helper: 'Картичка на целата висина од левата страна.',
    order: 10,
  },
  right_top: {
    title: 'Десно горе',
    helper: 'Широка картичка на врвот од десната колона.',
    order: 20,
  },
  right_bottom_left: {
    title: 'Десно долу лево',
    helper: 'Мала картичка долу-лево од десната колона.',
    order: 30,
  },
  right_bottom_right: {
    title: 'Десно долу десно',
    helper: 'Мала картичка долу-десно од десната колона.',
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
        tagline_mk: existing?.tagline_mk ?? '',
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
  const [expandedSlot, setExpandedSlot] = useState<HeroTileSlot | null>(null)

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
    if (!form.label_mk.trim() || !form.image_url.trim()) {
      alert('Пополнете го насловот и сликата.')
      return
    }

    setSavingSlot(slot)
    try {
      const meta = slotMeta[slot]
      const payload = {
        slot,
        label_mk: form.label_mk.trim(),
        label_en: null,
        tagline_mk: form.tagline_mk.trim(),
        tagline_en: null,
        image_url: form.image_url.trim(),
        url: (() => {
          const u = form.url.trim()
          return (u.startsWith('/') || u.startsWith('https://')) ? u : '/products'
        })(),
        is_active: form.is_active,
        display_order: meta.order,
      }

      const { error } = await supabase
        .from('hero_tiles')
        .upsert(payload as never, { onConflict: 'slot' })

      if (error) {
        throw new Error(error.message)
      }

      setExpandedSlot(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно зачувување на плочката.')
    } finally {
      setSavingSlot(null)
    }
  }

  const handleReset = (slot: HeroTileSlot) => {
    setForms((prev) => ({
      ...prev,
      [slot]: defaultForms[slot],
    }))
    setExpandedSlot(null)
  }

  const uploadTileImage = async (slot: HeroTileSlot, file: File) => {
    if (!isImageFile(file)) {
      throw new Error('Дозволени се само JPEG, PNG и WebP слики.')
    }
    const { full, thumbnail } = await processImage(file, 1200)
    const safeName = sanitizeFilename(file.name)
    const timestamp = Date.now()
    const fullPath = `hero-tiles/${slot}/${timestamp}-${safeName}`
    const thumbPath = `hero-tiles/${slot}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

    const [fullResult, thumbResult] = await Promise.all([
      supabase.storage.from(HERO_TILE_BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
      supabase.storage.from(HERO_TILE_BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
    ])

    if (fullResult.error) throw new Error(fullResult.error.message)
    if (thumbResult.error) throw new Error(thumbResult.error.message)

    const { data } = supabase.storage.from(HERO_TILE_BUCKET).getPublicUrl(fullPath)
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
      alert('Неуспешно прикачување на сликата.')
    } finally {
      setUploadingSlot(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Layout preview */}
      <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Преглед на распоред</p>
        <div className="grid grid-cols-[1fr_1fr] gap-2 h-32">
          <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500 row-span-2">
            Лево (Голема)
          </div>
          <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-500">
            Десно горе
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-500">
              Д. долу лево
            </div>
            <div className="rounded-lg bg-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-500">
              Д. долу десно
            </div>
          </div>
        </div>
      </div>

      {/* Tile cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {HERO_TILE_SLOTS.map((slot) => {
          const form = forms[slot]
          const meta = slotMeta[slot]
          const isExpanded = expandedSlot === slot

          return (
            <div key={slot} className="rounded-2xl bg-white shadow-card border border-neutral-100 overflow-hidden">
              {/* Collapsed header */}
              <button
                type="button"
                onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-neutral-50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex-shrink-0">
                  {form.image_url ? (
                    <Image
                      src={form.image_url}
                      alt={form.label_mk || meta.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                      ?
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {meta.title}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {form.label_mk || 'Без наслов'}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    form.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {form.is_active ? 'Активна' : 'Неактивна'}
                </span>

                {/* Chevron */}
                <svg
                  className={`w-5 h-5 text-neutral-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded edit form */}
              {isExpanded && (
                <div className="border-t border-neutral-100 p-5 space-y-5">
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-neutral-100">
                    {form.image_url ? (
                      <Image
                        src={form.image_url}
                        alt={form.label_mk || meta.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 400px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm bg-neutral-50">
                        Нема слика
                      </div>
                    )}
                    {uploadingSlot === slot && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-semibold text-neutral-500">
                        Прикачување…
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Наслов</label>
                    <input
                      className="input"
                      value={form.label_mk}
                      onChange={(e) => handleFormChange(slot, 'label_mk', e.target.value)}
                      placeholder="Наслов"
                    />
                  </div>

                  <div>
                    <label className="label">Краток опис</label>
                    <input
                      className="input"
                      value={form.tagline_mk}
                      onChange={(e) => handleFormChange(slot, 'tagline_mk', e.target.value)}
                      placeholder="Краток опис"
                    />
                  </div>

                  <div>
                    <label className="label">Слика</label>
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
                        {uploadingSlot === slot ? 'Прикачување…' : 'Прикачи слика'}
                      </label>
                      <input
                        className="input flex-1 min-w-[200px]"
                        value={form.image_url}
                        onChange={(e) => handleFormChange(slot, 'image_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Линк URL</label>
                    <input
                      className="input"
                      value={form.url}
                      onChange={(e) => handleFormChange(slot, 'url', e.target.value)}
                      placeholder="/products или https://instagram.com/..."
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-600"
                      checked={form.is_active}
                      onChange={(e) => handleFormChange(slot, 'is_active', e.target.checked)}
                    />
                    Видлива на сајтот
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(slot)}
                      disabled={savingSlot === slot}
                    >
                      {savingSlot === slot ? 'Зачувување…' : 'Зачувај'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleReset(slot)}
                      disabled={savingSlot === slot}
                    >
                      Откажи
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
