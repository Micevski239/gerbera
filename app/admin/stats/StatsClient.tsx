'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SiteStat } from '@/lib/supabase/types'

interface StatsClientProps {
  stats: SiteStat[]
}

interface StatFormState {
  label_mk: string
  label_en: string
  value: string
  suffix_mk: string
  suffix_en: string
  icon: string
  display_order: number
  is_visible: boolean
}

const ICON_OPTIONS = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'users', label: 'Users' },
  { value: 'box', label: 'Box' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
  { value: 'award', label: 'Award' },
  { value: 'check', label: 'Check' },
  { value: 'gift', label: 'Gift' },
]

export default function StatsClient({ stats }: StatsClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const defaultForms = useMemo(() => {
    const map: Record<string, StatFormState> = {}
    stats.forEach((stat) => {
      map[stat.id] = {
        label_mk: stat.label_mk,
        label_en: stat.label_en,
        value: stat.value,
        suffix_mk: stat.suffix_mk ?? '',
        suffix_en: stat.suffix_en ?? '',
        icon: stat.icon ?? '',
        display_order: stat.display_order,
        is_visible: stat.is_visible,
      }
    })
    return map
  }, [stats])

  const [forms, setForms] = useState<Record<string, StatFormState>>(defaultForms)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const nextOrder = useMemo(() => {
    if (stats.length === 0) return 1
    return Math.max(...stats.map((stat) => stat.display_order)) + 1
  }, [stats])

  const [newStat, setNewStat] = useState<StatFormState>({
    label_mk: '',
    label_en: '',
    value: '',
    suffix_mk: '',
    suffix_en: '',
    icon: 'star',
    display_order: nextOrder,
    is_visible: true,
  })

  useEffect(() => {
    setForms(defaultForms)
  }, [defaultForms])

  useEffect(() => {
    setNewStat((prev) => ({
      ...prev,
      display_order: nextOrder,
    }))
  }, [nextOrder])

  const handleFormChange = (statId: string, field: keyof StatFormState, value: string | number | boolean) => {
    setForms((prev) => ({
      ...prev,
      [statId]: {
        ...prev[statId],
        [field]: value,
      },
    }))
  }

  const resetForm = (statId: string) => {
    setForms((prev) => ({
      ...prev,
      [statId]: defaultForms[statId],
    }))
    setEditingId(null)
  }

  const handleSave = async (statId: string) => {
    const form = forms[statId]
    if (!form) return

    if (!form.label_mk.trim() || !form.label_en.trim() || !form.value.trim()) {
      alert('Labels (MK/EN) and value are required.')
      return
    }

    setSavingId(statId)
    try {
      const { error } = await supabase
        .from('site_stats')
        .update({
          label_mk: form.label_mk,
          label_en: form.label_en,
          value: form.value,
          suffix_mk: form.suffix_mk || null,
          suffix_en: form.suffix_en || null,
          icon: form.icon || null,
          display_order: form.display_order,
          is_visible: form.is_visible,
        } as never)
        .eq('id', statId)

      if (error) throw new Error(error.message)

      setEditingId(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save stat changes.')
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newStat.label_mk.trim() || !newStat.label_en.trim() || !newStat.value.trim()) {
      alert('Provide labels (MK/EN) and a value.')
      return
    }

    setCreating(true)
    try {
      const { error } = await supabase
        .from('site_stats')
        .insert({
          label_mk: newStat.label_mk,
          label_en: newStat.label_en,
          value: newStat.value,
          suffix_mk: newStat.suffix_mk || null,
          suffix_en: newStat.suffix_en || null,
          icon: newStat.icon || null,
          display_order: newStat.display_order,
          is_visible: newStat.is_visible,
        } as never)

      if (error) throw new Error(error.message)

      setNewStat({
        label_mk: '',
        label_en: '',
        value: '',
        suffix_mk: '',
        suffix_en: '',
        icon: 'star',
        display_order: nextOrder + 1,
        is_visible: true,
      })
      setShowCreateForm(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create stat.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (statId: string) => {
    if (!confirm('Delete this stat? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('site_stats')
        .delete()
        .eq('id', statId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete stat.')
    }
  }

  const handleMove = async (statId: string, direction: 'up' | 'down') => {
    const index = stats.findIndex((stat) => stat.id === statId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= stats.length) return

    const current = stats[index]
    const target = stats[targetIndex]

    setMovingId(statId)
    try {
      const { error: firstError } = await supabase
        .from('site_stats')
        .update({ display_order: target.display_order } as never)
        .eq('id', current.id)

      if (firstError) throw new Error(firstError.message)

      const { error: secondError } = await supabase
        .from('site_stats')
        .update({ display_order: current.display_order } as never)
        .eq('id', target.id)

      if (secondError) throw new Error(secondError.message)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to reorder stats.')
    } finally {
      setMovingId(null)
    }
  }

  const handleToggleVisibility = async (statId: string) => {
    const form = forms[statId]
    if (!form) return

    const newVisibility = !form.is_visible

    try {
      const { error } = await supabase
        .from('site_stats')
        .update({ is_visible: newVisibility } as never)
        .eq('id', statId)

      if (error) throw new Error(error.message)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update visibility.')
    }
  }

  const getIconPreview = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      case 'box':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'heart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'star':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        )
      case 'award':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        )
      case 'check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'gift':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{stats.length} stat{stats.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Add Stat'}
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-card space-y-4 border-2 border-primary-200">
          <h2 className="text-xl font-semibold text-neutral-800">New Stat</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Label (MK)</label>
              <input
                className="input"
                value={newStat.label_mk}
                onChange={(e) => setNewStat((prev) => ({ ...prev, label_mk: e.target.value }))}
                placeholder="Години искуство"
                required
              />
            </div>
            <div>
              <label className="label">Label (EN)</label>
              <input
                className="input"
                value={newStat.label_en}
                onChange={(e) => setNewStat((prev) => ({ ...prev, label_en: e.target.value }))}
                placeholder="Years Experience"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">Value</label>
              <input
                className="input"
                value={newStat.value}
                onChange={(e) => setNewStat((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="label">Suffix (MK)</label>
              <input
                className="input"
                value={newStat.suffix_mk}
                onChange={(e) => setNewStat((prev) => ({ ...prev, suffix_mk: e.target.value }))}
                placeholder="години, +, %"
              />
            </div>
            <div>
              <label className="label">Suffix (EN)</label>
              <input
                className="input"
                value={newStat.suffix_en}
                onChange={(e) => setNewStat((prev) => ({ ...prev, suffix_en: e.target.value }))}
                placeholder="years, +, %"
              />
            </div>
          </div>

          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setNewStat((prev) => ({ ...prev, icon: option.value }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    newStat.icon === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {getIconPreview(option.value)}
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Stat'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stats List */}
      <div className="space-y-3">
        {stats.map((stat, index) => {
          const form = forms[stat.id]
          if (!form) return null
          const isEditing = editingId === stat.id

          return (
            <div key={stat.id} className="rounded-xl bg-white shadow-card overflow-hidden">
              {/* Collapsed View */}
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  {getIconPreview(stat.icon ?? 'star')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600">{stat.value}</span>
                    <span className="text-lg text-neutral-500">{stat.suffix_en || stat.suffix_mk}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-700">{stat.label_en}</span>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-500">{stat.label_mk}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(stat.id)}
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
                      onClick={() => handleMove(stat.id, 'up')}
                      disabled={index === 0 || movingId === stat.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => handleMove(stat.id, 'down')}
                      disabled={index === stats.length - 1 || movingId === stat.id}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingId(isEditing ? null : stat.id)}
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
                      <label className="label">Label (MK)</label>
                      <input
                        className="input"
                        value={form.label_mk}
                        onChange={(e) => handleFormChange(stat.id, 'label_mk', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Label (EN)</label>
                      <input
                        className="input"
                        value={form.label_en}
                        onChange={(e) => handleFormChange(stat.id, 'label_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="label">Value</label>
                      <input
                        className="input"
                        value={form.value}
                        onChange={(e) => handleFormChange(stat.id, 'value', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Suffix (MK)</label>
                      <input
                        className="input"
                        value={form.suffix_mk}
                        onChange={(e) => handleFormChange(stat.id, 'suffix_mk', e.target.value)}
                        placeholder="години, +, %"
                      />
                    </div>
                    <div>
                      <label className="label">Suffix (EN)</label>
                      <input
                        className="input"
                        value={form.suffix_en}
                        onChange={(e) => handleFormChange(stat.id, 'suffix_en', e.target.value)}
                        placeholder="years, +, %"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFormChange(stat.id, 'icon', option.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            form.icon === option.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          {getIconPreview(option.value)}
                          <span className="text-sm">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(stat.id)}
                      disabled={savingId === stat.id}
                    >
                      {savingId === stat.id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => resetForm(stat.id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger ml-auto"
                      onClick={() => handleDelete(stat.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {stats.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            No stats yet. Click "+ Add Stat" to create your first one.
          </div>
        )}
      </div>
    </div>
  )
}
