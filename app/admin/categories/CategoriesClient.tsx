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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
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
    setEditingId(null)
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

      setEditingId(null)
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

      setNewCategory({
        name_mk: '',
        name_en: '',
        slug: '',
        description_mk: '',
        description_en: '',
        display_order: nextOrder + 10,
        is_visible: true,
        category_image_path: '',
      })
      setShowCreateForm(false)
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

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to reorder categories.')
    } finally {
      setMovingId(null)
    }
  }

  const handleToggleVisibility = async (categoryId: string) => {
    const form = forms[categoryId]
    if (!form) return

    const newVisibility = !form.is_visible

    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_visible: newVisibility } as never)
        .eq('id', categoryId)

      if (error) throw new Error(error.message)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update visibility.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-neutral-800">New Category</h2>

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
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-start">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex-shrink-0">
              {newCategoryImageUrl ? (
                <img src={newCategoryImageUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">No image</div>
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
                {uploadingImageId === 'new' ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Category'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((category, index) => {
          const form = forms[category.id]
          if (!form) return null
          const isEditing = editingId === category.id
          const categoryImageUrl = getImageUrl(form.category_image_path)

          return (
            <div key={category.id} className="rounded-xl bg-white shadow-card overflow-hidden">
              {/* Collapsed View */}
              <div className="flex items-center gap-4 p-4">
                {/* Image */}
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex-shrink-0">
                  {categoryImageUrl ? (
                    <img src={categoryImageUrl} alt={category.name_en} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">?</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 truncate">{category.name_en}</h3>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-600 truncate">{category.name_mk}</span>
                  </div>
                  <p className="text-sm text-neutral-500">/{category.slug}</p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(category.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                      form.is_visible
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {form.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(category.id, 'up')}
                      disabled={index === 0 || movingId === category.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(category.id, 'down')}
                      disabled={index === categories.length - 1 || movingId === category.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingId(isEditing ? null : category.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isEditing
                        ? 'bg-neutral-200 text-neutral-700'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {isEditing ? 'Close' : 'Edit'}
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isEditing && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50 space-y-4">
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
                        onChange={(e) => handleFormChange(category.id, 'name_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Slug</label>
                      <div className="flex gap-2">
                        <input
                          className="input flex-1"
                          value={form.slug}
                          onChange={(e) => handleFormChange(category.id, 'slug', e.target.value)}
                        />
                        <button type="button" className="btn btn-outline text-sm" onClick={() => handleGenerateSlug(category.id)}>
                          Gen
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Image</label>
                      <div className="flex gap-2">
                        <label className={`btn btn-secondary cursor-pointer text-sm flex-1 ${uploadingImageId === category.id ? 'pointer-events-none opacity-60' : ''}`}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { void handleImageSelect(category.id, e.target.files); e.target.value = '' }}
                          />
                          {uploadingImageId === category.id ? 'Uploading...' : 'Upload'}
                        </label>
                        {form.category_image_path && (
                          <button
                            type="button"
                            className="btn btn-outline text-sm"
                            onClick={() => handleFormChange(category.id, 'category_image_path', '')}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Description (MK)</label>
                      <textarea
                        className="textarea"
                        rows={2}
                        value={form.description_mk ?? ''}
                        onChange={(e) => handleFormChange(category.id, 'description_mk', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Description (EN)</label>
                      <textarea
                        className="textarea"
                        rows={2}
                        value={form.description_en ?? ''}
                        onChange={(e) => handleFormChange(category.id, 'description_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(category.id)}
                      disabled={savingId === category.id}
                    >
                      {savingId === category.id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetForm(category.id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger ml-auto"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            No categories yet. Click "+ Add Category" to create your first one.
          </div>
        )}
      </div>
    </div>
  )
}
