'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/supabase/types'
import { slugify } from '@/lib/utils'

interface CategoriesClientProps {
  categories: Category[]
}

interface CategoryFormState {
  name_mk: string
  slug: string
  description_mk: string | null
  display_order: number
  is_visible: boolean
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const defaultForms = useMemo(() => {
    const map: Record<string, CategoryFormState> = {}
    categories.forEach((category) => {
      map[category.id] = {
        name_mk: category.name_mk,
        slug: category.slug,
        description_mk: category.description_mk,
        display_order: category.display_order,
        is_visible: category.is_visible,
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

  const nextOrder = useMemo(() => {
    if (categories.length === 0) return 10
    return Math.max(...categories.map((cat) => cat.display_order)) + 10
  }, [categories])

  const [newCategory, setNewCategory] = useState<CategoryFormState>({
    name_mk: '',
    slug: '',
    description_mk: '',
    display_order: nextOrder,
    is_visible: true,
  })

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
    handleFormChange(categoryId, 'slug', slugify(form.name_mk || ''))
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

    if (!form.name_mk.trim() || !form.slug.trim()) {
      alert('Името и slug се задолжителни.')
      return
    }

    setSavingId(categoryId)
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: form.name_mk,
          name_mk: form.name_mk,
          name_en: null,
          slug: form.slug,
          description_mk: form.description_mk,
          description_en: null,
          description: form.description_mk,
          display_order: form.display_order,
          is_visible: form.is_visible,
        } as never)
        .eq('id', categoryId)

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
    if (!newCategory.name_mk.trim()) {
      alert('Внесете име за категоријата.')
      return
    }

    const slugValue = newCategory.slug.trim() || slugify(newCategory.name_mk)
    setCreating(true)
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name_mk,
          name_mk: newCategory.name_mk,
          name_en: null,
          slug: slugValue,
          description_mk: newCategory.description_mk,
          description_en: null,
          description: newCategory.description_mk,
          display_order: newCategory.display_order,
          is_visible: newCategory.is_visible,
        } as never)

      if (error) throw new Error(error.message)

      setNewCategory({
        name_mk: '',
        slug: '',
        description_mk: '',
        display_order: nextOrder + 10,
        is_visible: true,
      })
      setShowCreateForm(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно креирање на категоријата.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Избриши ја оваа категорија? Производите поврзани со неа исто така ќе бидат отстранети.')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Неуспешно бришење на категоријата.')
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
      alert('Неуспешно преместување на категоријата.')
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
      alert('Неуспешна промена на видливоста.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{categories.length} категори{categories.length !== 1 ? 'и' : 'ја'}</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Откажи' : '+ Додај категорија'}
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-neutral-800">Нова категорија</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Име</label>
              <input
                className="input"
                value={newCategory.name_mk}
                onChange={(e) => {
                  const value = e.target.value
                  setNewCategory((prev) => ({
                    ...prev,
                    name_mk: value,
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
                placeholder="автоматски генериран"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Креирање...' : 'Креирај категорија'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Откажи
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

          return (
            <div key={category.id} className="rounded-xl bg-white shadow-card overflow-hidden">
              {/* Collapsed View */}
              <div className="flex items-center gap-4 p-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-800 truncate">{category.name_mk}</h3>
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
                    {form.is_visible ? 'Видлива' : 'Скриена'}
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
                    {isEditing ? 'Затвори' : 'Уреди'}
                  </button>
                </div>
              </div>

              {/* Expanded Edit Form */}
              {isEditing && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Име</label>
                      <input
                        className="input"
                        value={form.name_mk}
                        onChange={(e) => handleFormChange(category.id, 'name_mk', e.target.value)}
                      />
                    </div>
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
                  </div>

                  <div>
                    <label className="label">Опис</label>
                    <textarea
                      className="textarea"
                      rows={2}
                      value={form.description_mk ?? ''}
                      onChange={(e) => handleFormChange(category.id, 'description_mk', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(category.id)}
                      disabled={savingId === category.id}
                    >
                      {savingId === category.id ? 'Зачувување...' : 'Зачувај'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetForm(category.id)}
                    >
                      Откажи
                    </button>
                    <button
                      className="btn btn-danger ml-auto"
                      onClick={() => handleDelete(category.id)}
                    >
                      Избриши
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            Нема категории. Кликнете „+ Додај категорија" за да ја креирате првата.
          </div>
        )}
      </div>
    </div>
  )
}
