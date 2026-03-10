'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, getImageUrl } from '@/lib/supabase/client'
import type { Occasion } from '@/lib/supabase/types'
import { processImage, slugify, isImageFile, sanitizeFilename } from '@/lib/utils'

interface OccasionsClientProps {
  occasions: Occasion[]
}

interface OccasionFormState {
  name_mk: string
  slug: string
  icon: string
  occasion_image_path: string
  description_mk: string | null
  display_order: number
  is_visible: boolean
}

const OCCASION_BUCKET = 'product-images'
const OCCASION_FOLDER = 'occasions'

export default function OccasionsClient({ occasions }: OccasionsClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const defaultForms = useMemo(() => {
    const map: Record<string, OccasionFormState> = {}
    occasions.forEach((occasion) => {
      map[occasion.id] = {
        name_mk: occasion.name_mk,
        slug: occasion.slug,
        icon: occasion.icon ?? '',
        occasion_image_path: occasion.occasion_image_path ?? '',
        description_mk: occasion.description_mk,
        display_order: occasion.display_order,
        is_visible: occasion.is_visible,
      }
    })
    return map
  }, [occasions])

  const [forms, setForms] = useState<Record<string, OccasionFormState>>(defaultForms)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)

  const nextOrder = useMemo(() => {
    if (occasions.length === 0) return 10
    return Math.max(...occasions.map((occ) => occ.display_order)) + 10
  }, [occasions])

  const [newOccasion, setNewOccasion] = useState<OccasionFormState>({
    name_mk: '',
    slug: '',
    icon: '',
    occasion_image_path: '',
    description_mk: '',
    display_order: nextOrder,
    is_visible: true,
  })

  const newOccasionImageUrl = getImageUrl(newOccasion.occasion_image_path)

  useEffect(() => {
    setForms(defaultForms)
  }, [defaultForms])

  useEffect(() => {
    setNewOccasion((prev) => ({
      ...prev,
      display_order: nextOrder,
    }))
  }, [nextOrder])

  const handleFormChange = (occasionId: string, field: keyof OccasionFormState, value: string | number | boolean | null) => {
    setForms((prev) => ({
      ...prev,
      [occasionId]: {
        ...prev[occasionId],
        [field]: value as never,
      },
    }))
  }

  const handleGenerateSlug = (occasionId: string) => {
    const form = forms[occasionId]
    if (!form) return
    handleFormChange(occasionId, 'slug', slugify(form.name_mk || ''))
  }

  const uploadOccasionImage = async (occasionId: string | null, file: File) => {
    if (!isImageFile(file)) {
      throw new Error('Дозволени се само JPEG, PNG и WebP слики.')
    }
    const { full, thumbnail } = await processImage(file, 1200)
    const safeName = sanitizeFilename(file.name)
    const prefix = occasionId ?? 'new'
    const timestamp = Date.now()
    const fullPath = `${OCCASION_FOLDER}/${prefix}/${timestamp}-${safeName}`
    const thumbPath = `${OCCASION_FOLDER}/${prefix}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

    const [fullResult, thumbResult] = await Promise.all([
      supabase.storage.from(OCCASION_BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
      supabase.storage.from(OCCASION_BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
    ])

    if (fullResult.error) throw new Error(fullResult.error.message)
    if (thumbResult.error) throw new Error(thumbResult.error.message)

    return fullPath
  }

  const handleImageSelect = async (occasionId: string | null, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    setUploadingImageId(occasionId ?? 'new')
    try {
      const path = await uploadOccasionImage(occasionId, file)
      if (occasionId) {
        setForms((prev) => ({
          ...prev,
          [occasionId]: {
            ...prev[occasionId],
            occasion_image_path: path,
          },
        }))
      } else {
        setNewOccasion((prev) => ({ ...prev, occasion_image_path: path }))
      }
    } catch (error) {
      console.error(error)
      alert('Неуспешно прикачување на сликата.')
    } finally {
      setUploadingImageId(null)
    }
  }

  const resetForm = (occasionId: string) => {
    setForms((prev) => ({
      ...prev,
      [occasionId]: defaultForms[occasionId],
    }))
    setEditingId(null)
  }

  const handleSave = async (occasionId: string) => {
    const form = forms[occasionId]
    if (!form) return

    if (!form.name_mk.trim() || !form.slug.trim()) {
      alert('Името и slug се задолжителни.')
      return
    }

    setSavingId(occasionId)
    try {
      const { error } = await supabase
        .from('occasions')
        .update({
          name: form.name_mk,
          name_mk: form.name_mk,
          name_en: null,
          slug: form.slug,
          icon: form.icon || null,
          occasion_image_path: form.occasion_image_path || null,
          description_mk: form.description_mk,
          description_en: null,
          display_order: form.display_order,
          is_visible: form.is_visible,
        } as never)
        .eq('id', occasionId)

      if (error) throw new Error(error.message)

      setEditingId(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно зачувување на промените.')
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newOccasion.name_mk.trim()) {
      alert('Внесете име за пригодата.')
      return
    }

    const slugValue = newOccasion.slug.trim() || slugify(newOccasion.name_mk)
    setCreating(true)
    try {
      const { error } = await supabase
        .from('occasions')
        .insert({
          name: newOccasion.name_mk,
          name_mk: newOccasion.name_mk,
          name_en: null,
          slug: slugValue,
          icon: newOccasion.icon || null,
          occasion_image_path: newOccasion.occasion_image_path || null,
          description_mk: newOccasion.description_mk,
          description_en: null,
          display_order: newOccasion.display_order,
          is_visible: newOccasion.is_visible,
        } as never)

      if (error) throw new Error(error.message)

      setNewOccasion({
        name_mk: '',
        slug: '',
        icon: '',
        occasion_image_path: '',
        description_mk: '',
        display_order: nextOrder + 10,
        is_visible: true,
      })
      setShowCreateForm(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно креирање на пригодата.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (occasionId: string) => {
    if (!confirm('Избриши ја оваа пригода?')) return

    try {
      const { error } = await supabase
        .from('occasions')
        .delete()
        .eq('id', occasionId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно бришење на пригодата.')
    }
  }

  const handleMove = async (occasionId: string, direction: 'up' | 'down') => {
    const index = occasions.findIndex((occasion) => occasion.id === occasionId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= occasions.length) return

    const current = occasions[index]
    const target = occasions[targetIndex]

    setMovingId(occasionId)
    try {
      const { error: firstError } = await supabase
        .from('occasions')
        .update({ display_order: target.display_order } as never)
        .eq('id', current.id)

      if (firstError) throw new Error(firstError.message)

      const { error: secondError } = await supabase
        .from('occasions')
        .update({ display_order: current.display_order } as never)
        .eq('id', target.id)

      if (secondError) throw new Error(secondError.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно преместување на пригодата.')
    } finally {
      setMovingId(null)
    }
  }

  const handleToggleVisibility = async (occasionId: string) => {
    const form = forms[occasionId]
    if (!form) return

    const newVisibility = !form.is_visible

    try {
      const { error } = await supabase
        .from('occasions')
        .update({ is_visible: newVisibility } as never)
        .eq('id', occasionId)

      if (error) throw new Error(error.message)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешна промена на видливоста.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{occasions.length} пригод{occasions.length !== 1 ? 'и' : 'а'}</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Откажи' : '+ Додај пригода'}
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-neutral-800">Нова пригода</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Име</label>
              <input
                className="input"
                value={newOccasion.name_mk}
                onChange={(e) => {
                  const value = e.target.value
                  setNewOccasion((prev) => ({
                    ...prev,
                    name_mk: value,
                    slug: slugify(value),
                  }))
                }}
                required
              />
            </div>
            <div>
              <label className="label">Икона (Емоџи)</label>
              <input
                className="input"
                value={newOccasion.icon}
                onChange={(e) => setNewOccasion((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="🎂"
              />
            </div>
            <div>
              <label className="label">Slug</label>
              <input
                className="input"
                value={newOccasion.slug}
                onChange={(e) => setNewOccasion((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="автоматски генериран"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-start">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 flex-shrink-0">
              {newOccasionImageUrl ? (
                <img src={newOccasionImageUrl} alt="Преглед" className="h-full w-full object-cover" />
              ) : newOccasion.icon ? (
                <div className="flex h-full w-full items-center justify-center text-3xl bg-primary-50">{newOccasion.icon}</div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">Нема слика</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className={`btn btn-secondary cursor-pointer text-sm ${uploadingImageId === 'new' ? 'pointer-events-none opacity-60' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { void handleImageSelect(null, e.target.files); e.target.value = '' }}
                />
                {uploadingImageId === 'new' ? 'Прикачување...' : 'Прикачи слика'}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Креирање...' : 'Креирај пригода'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Откажи
            </button>
          </div>
        </form>
      )}

      {/* Occasions List */}
      <div className="space-y-3">
        {occasions.map((occasion, index) => {
          const form = forms[occasion.id]
          if (!form) return null
          const isEditing = editingId === occasion.id
          const occasionImageUrl = getImageUrl(form.occasion_image_path)

          return (
            <div key={occasion.id} className="rounded-xl bg-white shadow-card overflow-hidden">
              {/* Collapsed View */}
              <div className="flex items-center gap-4 p-4">
                {/* Image/Icon */}
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 flex-shrink-0">
                  {occasionImageUrl ? (
                    <img src={occasionImageUrl} alt={occasion.name_mk} className="h-full w-full object-cover" />
                  ) : occasion.icon ? (
                    <div className="flex h-full w-full items-center justify-center text-2xl bg-primary-50">{occasion.icon}</div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">?</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-800 truncate">{occasion.name_mk}</h3>
                  <p className="text-sm text-neutral-500">/{occasion.slug}</p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(occasion.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                      form.is_visible
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {form.is_visible ? 'Видлива' : 'Скриена'}
                  </button>

                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(occasion.id, 'up')}
                      disabled={index === 0 || movingId === occasion.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(occasion.id, 'down')}
                      disabled={index === occasions.length - 1 || movingId === occasion.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingId(isEditing ? null : occasion.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isEditing
                        ? 'bg-neutral-200 text-neutral-700'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {isEditing ? 'Затвори' : 'Уреди'}
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isEditing && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="label">Име</label>
                      <input
                        className="input"
                        value={form.name_mk}
                        onChange={(e) => handleFormChange(occasion.id, 'name_mk', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Slug</label>
                      <div className="flex gap-2">
                        <input
                          className="input flex-1"
                          value={form.slug}
                          onChange={(e) => handleFormChange(occasion.id, 'slug', e.target.value)}
                        />
                        <button type="button" className="btn btn-outline text-sm" onClick={() => handleGenerateSlug(occasion.id)}>
                          Gen
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Икона (Емоџи)</label>
                      <input
                        className="input"
                        value={form.icon}
                        onChange={(e) => handleFormChange(occasion.id, 'icon', e.target.value)}
                        placeholder="🎂"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Слика</label>
                    <div className="flex gap-2">
                      <label className={`btn btn-secondary cursor-pointer text-sm flex-1 ${uploadingImageId === occasion.id ? 'pointer-events-none opacity-60' : ''}`}>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { void handleImageSelect(occasion.id, e.target.files); e.target.value = '' }}
                        />
                        {uploadingImageId === occasion.id ? 'Прикачување...' : 'Прикачи'}
                      </label>
                      {form.occasion_image_path && (
                        <button
                          type="button"
                          className="btn btn-outline text-sm"
                          onClick={() => handleFormChange(occasion.id, 'occasion_image_path', '')}
                        >
                          Избриши
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label">Опис</label>
                    <textarea
                      className="textarea"
                      rows={2}
                      value={form.description_mk ?? ''}
                      onChange={(e) => handleFormChange(occasion.id, 'description_mk', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(occasion.id)}
                      disabled={savingId === occasion.id}
                    >
                      {savingId === occasion.id ? 'Зачувување...' : 'Зачувај'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetForm(occasion.id)}
                    >
                      Откажи
                    </button>
                    <button
                      className="btn btn-danger ml-auto"
                      onClick={() => handleDelete(occasion.id)}
                    >
                      Избриши
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {occasions.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            Нема пригоди. Кликнете „+ Додај пригода" за да ја креирате првата.
          </div>
        )}
      </div>
    </div>
  )
}
