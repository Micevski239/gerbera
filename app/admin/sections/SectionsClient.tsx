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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

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
    setEditingId(null)
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

      setEditingId(null)
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
      setShowCreateForm(false)
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

  const handleToggleActive = async (sectionId: string) => {
    const form = forms[sectionId]
    if (!form) return

    const newActive = !form.is_active

    try {
      const { error } = await supabase
        .from('sections')
        .update({ is_active: newActive } as never)
        .eq('id', sectionId)

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
        <p className="text-sm text-neutral-500">{sections.length} section{sections.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Add Section'}
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-neutral-800">New Section</h2>

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

          <div className="grid gap-4 md:grid-cols-3">
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
                    {category.name_en}
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

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Section'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const form = forms[section.id]
          if (!form) return null
          const isEditing = editingId === section.id
          const categoryName = categories.find((cat) => cat.id === form.category_id)?.name_en || 'Unknown'

          return (
            <div key={section.id} className="rounded-xl bg-white shadow-card overflow-hidden">
              {/* Collapsed View */}
              <div className="flex items-center gap-4 p-4">
                {/* Shape indicator */}
                <div className={`h-10 w-10 flex items-center justify-center flex-shrink-0 ${
                  form.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                } bg-primary-100 text-primary-600`}>
                  {form.shape === 'circle' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 truncate">{section.title_en}</h3>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-600 truncate">{section.title_mk}</span>
                  </div>
                  <p className="text-sm text-neutral-500">{categoryName} • {form.product_limit} products</p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(section.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                      form.is_active
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {form.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(section.id, 'up')}
                      disabled={index === 0 || movingId === section.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(section.id, 'down')}
                      disabled={index === sections.length - 1 || movingId === section.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingId(isEditing ? null : section.id)}
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
                        <option value="">Select</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                        ))}
                      </select>
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
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(section.id)}
                      disabled={savingId === section.id}
                    >
                      {savingId === section.id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetForm(section.id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger ml-auto"
                      onClick={() => handleDelete(section.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {sections.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            No sections yet. Click "+ Add Section" to create your first one.
          </div>
        )}
      </div>
    </div>
  )
}
