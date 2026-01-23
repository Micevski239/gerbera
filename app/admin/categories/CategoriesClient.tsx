'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, getImageUrl } from '@/lib/supabase/client'
import type { Category } from '@/lib/supabase/types'
import { compressImage, slugify } from '@/lib/utils'

interface CategoriesClientProps {
  categories: Category[]
}

interface CategoryFormState {
  name_mk: string
  name_en: string
  slug: string
  description_mk: string | null
  description_en: string | null
  display_order: number
  is_visible: boolean
  category_image_path: string
}

const CATEGORY_BUCKET = 'product-images'
const CATEGORY_FOLDER = 'categories'

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const defaultForms = useMemo(() => {
    const map: Record<string, CategoryFormState> = {}
    categories.forEach((category) => {
      map[category.id] = {
        name_mk: category.name_mk,
        name_en: category.name_en,
        slug: category.slug,
        description_mk: category.description_mk,
        description_en: category.description_en,
        display_order: category.display_order,
        is_visible: category.is_visible,
        category_image_path: category.category_image_path ?? '',
      }
    })
    return map
  }, [categories])

  const [forms, setForms] = useState<Record<string, CategoryFormState>>(defaultForms)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)

  const nextOrder = useMemo(() => {
    if (categories.length === 0) return 10
    return Math.max(...categories.map((cat) => cat.display_order)) + 10
  }, [categories])

  const [newCategory, setNewCategory] = useState<CategoryFormState>({
    name_mk: '',
    name_en: '',
    slug: '',
    description_mk: '',
    description_en: '',
    display_order: nextOrder,
    is_visible: true,
    category_image_path: '',
  })

  const newCategoryImageUrl = getImageUrl(newCategory.category_image_path)

  useEffect(() => {
    setForms(defaultForms)
  }, [defaultForms])

  useEffect(() => {
    setNewCategory((prev) => ({
      ...prev,
      display_order: nextOrder,
    }))
  }, [nextOrder])

  const handleFormChange = (categoryId: string, field: keyof CategoryFormState, value: string | number | boolean | null) => {
    setForms((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value as never,
      },
    }))
  }

  const handleGenerateSlug = (categoryId: string) => {
    const form = forms[categoryId]
    if (!form) return
    handleFormChange(categoryId, 'slug', slugify(form.name_en || form.name_mk || ''))
  }

  const uploadCategoryImage = async (categoryId: string | null, file: File) => {
    const optimized = await compressImage(file, 1600)
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
    const prefix = categoryId ?? 'new'
    const path = `${CATEGORY_FOLDER}/${prefix}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from(CATEGORY_BUCKET)
      .upload(path, optimized, { cacheControl: '3600', upsert: true })

    if (error) {
      throw new Error(error.message)
    }

    return path
  }

  const handleImageSelect = async (categoryId: string | null, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    setUploadingImageId(categoryId ?? 'new')
    try {
      const path = await uploadCategoryImage(categoryId, file)
      if (categoryId) {
        setForms((prev) => ({
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            category_image_path: path,
          },
        }))
      } else {
        setNewCategory((prev) => ({ ...prev, category_image_path: path }))
      }
    } catch (error) {
      console.error(error)
      alert('Failed to upload the image. Please try again.')
    } finally {
      setUploadingImageId(null)
    }
  }

  const resetForm = (categoryId: string) => {
    setForms((prev) => ({
      ...prev,
      [categoryId]: defaultForms[categoryId],
    }))
  }

  const handleSave = async (categoryId: string) => {
    const form = forms[categoryId]
    if (!form) return

    if (!form.name_mk.trim() || !form.name_en.trim() || !form.slug.trim()) {
      alert('Name (MK/EN) and slug are required.')
      return
    }

    setSavingId(categoryId)
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: form.name_mk,
          name_mk: form.name_mk,
          name_en: form.name_en,
          slug: form.slug,
          description_mk: form.description_mk,
          description_en: form.description_en,
          description: form.description_mk,
          category_image_path: form.category_image_path || null,
          display_order: form.display_order,
          is_visible: form.is_visible,
        } as never)
        .eq('id', categoryId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save category changes.')
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newCategory.name_mk.trim() || !newCategory.name_en.trim()) {
      alert('Provide Macedonian and English names for the category.')
      return
    }

    const slugValue = newCategory.slug.trim() || slugify(newCategory.name_en || newCategory.name_mk)
    setCreating(true)
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name_mk,
          name_mk: newCategory.name_mk,
          name_en: newCategory.name_en,
          slug: slugValue,
          description_mk: newCategory.description_mk,
          description_en: newCategory.description_en,
          description: newCategory.description_mk,
          category_image_path: newCategory.category_image_path || null,
          display_order: newCategory.display_order,
          is_visible: newCategory.is_visible,
        } as never)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create category.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Delete this category? Products linked to it will also be removed.')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete category.')
    }
  }

  const handleMove = async (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex((category) => category.id === categoryId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return

    const current = categories[index]
    const target = categories[targetIndex]

    setMovingId(categoryId)
    try {
      const { error: firstError } = await supabase
        .from('categories')
        .update({ display_order: target.display_order } as never)
        .eq('id', current.id)

      if (firstError) throw new Error(firstError.message)

      const { error: secondError } = await supabase
        .from('categories')
        .update({ display_order: current.display_order } as never)
        .eq('id', target.id)

      if (secondError) throw new Error(secondError.message)

      location.reload()
    } catch (error) {
      console.error(error)
      alert('Failed to reorder categories.')
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Create Category</h2>
          <p className="text-sm text-neutral-500">Categories help group products and populate homepage sections.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Name (MK)</label>
            <input
              className="input"
              value={newCategory.name_mk}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name_mk: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Name (EN)</label>
            <input
              className="input"
              value={newCategory.name_en}
              onChange={(e) => {
                const value = e.target.value
                setNewCategory((prev) => ({
                  ...prev,
                  name_en: value,
                  slug: slugify(value),
                }))
              }}
              required
            />
          </div>
          <div>
            <label className="label">Slug</label>
            <input
              className="input"
              value={newCategory.slug}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="birthday-arrangements"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="label">Category image</label>
          <div className="flex flex-wrap gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
              {newCategoryImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={newCategoryImageUrl}
                  alt="Category preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-2">
              <div className="flex flex-wrap gap-3">
                <label className={`btn btn-secondary cursor-pointer ${uploadingImageId === 'new' ? 'pointer-events-none opacity-60' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handleImageSelect(null, e.target.files)
                      e.target.value = ''
                    }}
                  />
                  {uploadingImageId === 'new' ? 'Uploading…' : 'Upload image'}
                </label>
                {newCategory.category_image_path && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setNewCategory((prev) => ({ ...prev, category_image_path: '' }))}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                className="input"
                value={newCategory.category_image_path}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, category_image_path: e.target.value }))}
                placeholder="categories/spring-arrangements/cover.jpg"
              />
              <p className="text-xs text-neutral-500">Stored as a Supabase storage path. Upload or paste manually.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5 text-primary-600"
              checked={newCategory.is_visible}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, is_visible: e.target.checked }))}
            />
            <span>Visible to customers</span>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Description (MK)</label>
            <textarea
              className="textarea"
              rows={3}
              value={newCategory.description_mk ?? ''}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, description_mk: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Description (EN)</label>
            <textarea
              className="textarea"
              rows={3}
              value={newCategory.description_en ?? ''}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, description_en: e.target.value }))}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Saving…' : 'Create Category'}
        </button>
      </form>

      <div className="space-y-6">
        {categories.map((category, index) => {
          const form = forms[category.id]
          if (!form) return null
          const categoryImageUrl = getImageUrl(form.category_image_path)
          return (
            <div key={category.id} className="rounded-2xl bg-white p-6 shadow-card space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">{category.name_mk}</h3>
                  <p className="text-sm text-neutral-500">Slug: {category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                    onClick={() => handleMove(category.id, 'up')}
                    disabled={index === 0 || movingId === category.id}
                  >
                    ↑
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                    onClick={() => handleMove(category.id, 'down')}
                    disabled={index === categories.length - 1 || movingId === category.id}
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Name (MK)</label>
                  <input
                    className="input"
                    value={form.name_mk}
                    onChange={(e) => handleFormChange(category.id, 'name_mk', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Name (EN)</label>
                  <input
                    className="input"
                    value={form.name_en}
                    onChange={(e) => {
                      const value = e.target.value
                      handleFormChange(category.id, 'name_en', value)
                      handleFormChange(category.id, 'slug', slugify(value))
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="label">Slug</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      value={form.slug}
                      onChange={(e) => handleFormChange(category.id, 'slug', e.target.value)}
                    />
                    <button type="button" className="btn btn-outline" onClick={() => handleGenerateSlug(category.id)}>
                      Generate
                    </button>
                  </div>
                </div>
                <label className="label flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-600"
                    checked={form.is_visible}
                    onChange={(e) => handleFormChange(category.id, 'is_visible', e.target.checked)}
                  />
                  <span>Visible to customers</span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="label">Category image</label>
                <div className="flex flex-wrap gap-4">
                  <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    {categoryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={categoryImageUrl}
                        alt={`${form.name_en} preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-[220px] flex-1 flex-col gap-2">
                    <div className="flex flex-wrap gap-3">
                      <label className={`btn btn-secondary cursor-pointer ${uploadingImageId === category.id ? 'pointer-events-none opacity-60' : ''}`}>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            void handleImageSelect(category.id, e.target.files)
                            e.target.value = ''
                          }}
                        />
                        {uploadingImageId === category.id ? 'Uploading…' : 'Upload image'}
                      </label>
                      {form.category_image_path && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleFormChange(category.id, 'category_image_path', '')}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      className="input"
                      value={form.category_image_path}
                      onChange={(e) => handleFormChange(category.id, 'category_image_path', e.target.value)}
                      placeholder="categories/autumn-gifts/cover.jpg"
                    />
                    <p className="text-xs text-neutral-500">Paste an existing storage path or upload a new image.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Description (MK)</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={form.description_mk ?? ''}
                    onChange={(e) => handleFormChange(category.id, 'description_mk', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Description (EN)</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={form.description_en ?? ''}
                    onChange={(e) => handleFormChange(category.id, 'description_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${form.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {form.is_visible ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={() => handleSave(category.id)} disabled={savingId === category.id}>
                  {savingId === category.id ? 'Saving…' : 'Save changes'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => resetForm(category.id)} disabled={savingId === category.id}>
                  Reset
                </button>
                <button className="btn btn-danger" type="button" onClick={() => handleDelete(category.id)}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-neutral-500">
            No categories yet. Use the form above to add your first category.
          </div>
        )}
      </div>
    </div>
  )
}
