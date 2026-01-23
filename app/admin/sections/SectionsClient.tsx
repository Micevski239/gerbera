'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category, SectionInsert, SectionShape, SectionUpdate } from '@/lib/supabase/types'
import type { SectionWithCategory } from '@/types/sections'

interface SectionsClientProps {
  sections: SectionWithCategory[]
  categories: Category[]
}

interface SectionFormState {
  title_mk: string
  title_en: string
  shape: SectionShape
  category_id: string
  product_limit: number
  order: number
  is_active: boolean
}

export default function SectionsClient({ sections, categories }: SectionsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const defaultForms = useMemo(() => {
    const values: Record<string, SectionFormState> = {}
    sections.forEach((section) => {
      values[section.id] = {
        title_mk: section.title_mk,
        title_en: section.title_en,
        shape: section.shape,
        category_id: section.category_id,
        product_limit: section.product_limit,
        order: section.order,
        is_active: section.is_active,
      }
    })
    return values
  }, [sections])

  const [forms, setForms] = useState<Record<string, SectionFormState>>(defaultForms)
  const nextOrder = useMemo(() => {
    if (sections.length === 0) return 10
    return Math.max(...sections.map((section) => section.order)) + 10
  }, [sections])

  const [newSection, setNewSection] = useState<SectionFormState>({
    title_mk: '',
    title_en: '',
    shape: 'square',
    category_id: categories[0]?.id || '',
    product_limit: 8,
    order: nextOrder,
    is_active: true,
  })
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    setForms(defaultForms)
  }, [defaultForms])

  useEffect(() => {
    setNewSection((prev) => ({
      ...prev,
      order: nextOrder,
      category_id: prev.category_id || categories[0]?.id || '',
    }))
  }, [nextOrder, categories])

  const handleFormChange = (sectionId: string, field: keyof SectionFormState, value: string | number | boolean) => {
    setForms((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value,
      },
    }))
  }

  const resetForm = (sectionId: string) => {
    setForms((prev) => ({
      ...prev,
      [sectionId]: defaultForms[sectionId],
    }))
  }

  const handleSave = async (sectionId: string) => {
    const form = forms[sectionId]
    if (!form) return

    if (!form.title_mk.trim() || !form.title_en.trim()) {
      alert('Section titles cannot be empty.')
      return
    }

    if (!form.category_id) {
      alert('Please select a category.')
      return
    }

    setSavingId(sectionId)
    try {
      const updateData: SectionUpdate = {
        title_mk: form.title_mk,
        title_en: form.title_en,
        shape: form.shape,
        category_id: form.category_id,
        product_limit: form.product_limit,
        order: form.order,
        is_active: form.is_active,
      }

      const { error } = await supabase
        .from('sections')
        .update(updateData as never)
        .eq('id', sectionId)

      if (error) {
        throw new Error(error.message)
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save section changes.')
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newSection.title_mk.trim() || !newSection.title_en.trim() || !newSection.category_id) {
      alert('Fill out all required fields before creating a section.')
      return
    }

    setCreating(true)
    try {
      const insertData: SectionInsert = {
        title_mk: newSection.title_mk,
        title_en: newSection.title_en,
        shape: newSection.shape,
        category_id: newSection.category_id,
        product_limit: newSection.product_limit,
        order: newSection.order,
        is_active: newSection.is_active,
      }

      const { error } = await supabase
        .from('sections')
        .insert(insertData as never)

      if (error) {
        throw new Error(error.message)
      }

      setNewSection({
        title_mk: '',
        title_en: '',
        shape: 'square',
        category_id: categories[0]?.id || '',
        product_limit: 8,
        order: nextOrder + 10,
        is_active: true,
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create section.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return

    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)

      if (error) {
        throw new Error(error.message)
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete section.')
    }
  }

  const handleMove = async (sectionId: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((section) => section.id === sectionId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const current = sections[index]
    const target = sections[targetIndex]

    setMovingId(sectionId)
    try {
      const { error: firstError } = await supabase
        .from('sections')
        .update({ order: target.order } as never)
        .eq('id', current.id)

      if (firstError) throw new Error(firstError.message)

      const { error: secondError } = await supabase
        .from('sections')
        .update({ order: current.order } as never)
        .eq('id', target.id)

      if (secondError) throw new Error(secondError.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to reorder sections.')
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Create Section</h2>
          <p className="text-sm text-neutral-500">Each section renders a product grid based on the selected category.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Title (MK)</label>
            <input
              className="input"
              value={newSection.title_mk}
              onChange={(e) => setNewSection((prev) => ({ ...prev, title_mk: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Title (EN)</label>
            <input
              className="input"
              value={newSection.title_en}
              onChange={(e) => setNewSection((prev) => ({ ...prev, title_en: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={newSection.category_id}
              onChange={(e) => setNewSection((prev) => ({ ...prev, category_id: e.target.value }))}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_mk} / {category.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Product Limit</label>
            <input
              type="number"
              min={1}
              className="input"
              value={newSection.product_limit}
              onChange={(e) => setNewSection((prev) => ({ ...prev, product_limit: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Order</label>
            <input
              type="number"
              className="input"
              value={newSection.order}
              onChange={(e) => setNewSection((prev) => ({ ...prev, order: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Shape</label>
            <select
              className="input"
              value={newSection.shape}
              onChange={(e) => setNewSection((prev) => ({ ...prev, shape: e.target.value as SectionShape }))}
            >
              <option value="square">Square grid</option>
              <option value="circle">Circle</option>
            </select>
          </div>
        </div>
        <label className="inline-flex items-center gap-3">
          <input
            type="checkbox"
            className="w-5 h-5 text-primary-600"
            checked={newSection.is_active}
            onChange={(e) => setNewSection((prev) => ({ ...prev, is_active: e.target.checked }))}
          />
          <span className="text-sm text-neutral-600">Visible on storefront</span>
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={creating}
        >
          {creating ? 'Saving…' : 'Create Section'}
        </button>
      </form>

      <div className="space-y-6">
        {sections.map((section, index) => {
          const form = forms[section.id]
          if (!form) return null
          const categoryName = categories.find((cat) => cat.id === form.category_id)
          return (
            <div key={section.id} className="rounded-2xl bg-white p-6 shadow-card space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">{section.title_mk}</h3>
                  <p className="text-sm text-neutral-500">{section.title_en}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                    onClick={() => handleMove(section.id, 'up')}
                    disabled={index === 0 || movingId === section.id}
                  >
                    ↑
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                    onClick={() => handleMove(section.id, 'down')}
                    disabled={index === sections.length - 1 || movingId === section.id}
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Title (MK)</label>
                  <input
                    className="input"
                    value={form.title_mk}
                    onChange={(e) => handleFormChange(section.id, 'title_mk', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Title (EN)</label>
                  <input
                    className="input"
                    value={form.title_en}
                    onChange={(e) => handleFormChange(section.id, 'title_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={form.category_id}
                    onChange={(e) => handleFormChange(section.id, 'category_id', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name_mk} / {category.name_en}
                      </option>
                    ))}
                  </select>
                  {categoryName && (
                    <p className="mt-1 text-xs text-neutral-500">Currently showing: {categoryName.name_en}</p>
                  )}
                </div>
                <div>
                  <label className="label">Product Limit</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.product_limit}
                    onChange={(e) => handleFormChange(section.id, 'product_limit', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    className="input"
                    value={form.order}
                    onChange={(e) => handleFormChange(section.id, 'order', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Shape</label>
                  <select
                    className="input"
                    value={form.shape}
                    onChange={(e) => handleFormChange(section.id, 'shape', e.target.value as SectionShape)}
                  >
                    <option value="square">Square grid</option>
                    <option value="circle">Circle</option>
                  </select>
                </div>
                <label className="label flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-600"
                    checked={form.is_active}
                    onChange={(e) => handleFormChange(section.id, 'is_active', e.target.checked)}
                  />
                  <span>Visible on storefront</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSave(section.id)}
                  disabled={savingId === section.id}
                >
                  {savingId === section.id ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => resetForm(section.id)}
                  disabled={savingId === section.id}
                >
                  Reset
                </button>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => handleDelete(section.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}

        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-neutral-500">
            No sections yet. Use the form above to add your first product grid.
          </div>
        )}
      </div>
    </div>
  )
}
