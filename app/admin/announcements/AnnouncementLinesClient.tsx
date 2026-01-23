'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type {
  AnnouncementLine,
  AnnouncementLineInsert,
  AnnouncementLineUpdate,
} from '@/lib/supabase/types'

interface AnnouncementLinesClientProps {
  announcements: AnnouncementLine[]
}

export default function AnnouncementLinesClient({ announcements }: AnnouncementLinesClientProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    text_mk: '',
    text_en: '',
  })

  const resetForm = () => {
    setFormData({ text_mk: '', text_en: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.text_mk.trim() || !formData.text_en.trim()) return

    setSaving(true)
    try {
      const supabase = createClient()

      if (editingId) {
        const updateData: AnnouncementLineUpdate = {
          text_mk: formData.text_mk,
          text_en: formData.text_en,
        }

        const { error } = await supabase
          .from('announcement_lines')
          .update(updateData as never)
          .eq('id', editingId)

        if (error) {
          alert('Failed to update announcement: ' + error.message)
          setSaving(false)
          return
        }
      } else {
        const insertData: AnnouncementLineInsert = {
          text_mk: formData.text_mk,
          text_en: formData.text_en,
          display_order: announcements.length * 10,
        }

        const { error } = await supabase
          .from('announcement_lines')
          .insert(insertData as never)

        if (error) {
          alert('Failed to add announcement: ' + error.message)
          setSaving(false)
          return
        }
      }

      resetForm()
      router.refresh()
    } catch (error) {
      alert('An unexpected error occurred while saving the announcement line.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (line: AnnouncementLine) => {
    setEditingId(line.id)
    setFormData({ text_mk: line.text_mk, text_en: line.text_en })
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement line?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcement_lines')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Failed to delete announcement: ' + error.message)
        return
      }

      router.refresh()
    } catch (error) {
      alert('An unexpected error occurred while deleting the announcement line.')
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const supabase = createClient()
      const updateData: AnnouncementLineUpdate = { is_active: !current }
      const { error } = await supabase
        .from('announcement_lines')
        .update(updateData as never)
        .eq('id', id)

      if (error) {
        alert('Failed to update announcement status: ' + error.message)
        return
      }

      router.refresh()
    } catch (error) {
      alert('An unexpected error occurred while updating the announcement status.')
    }
  }

  const swapDisplayOrder = async (current: AnnouncementLine, target: AnnouncementLine) => {
    try {
      const supabase = createClient()
      const { error: firstError } = await supabase
        .from('announcement_lines')
        .update({ display_order: target.display_order } as never)
        .eq('id', current.id)

      if (firstError) {
        throw new Error(firstError.message)
      }

      const { error: secondError } = await supabase
        .from('announcement_lines')
        .update({ display_order: current.display_order } as never)
        .eq('id', target.id)

      if (secondError) {
        throw new Error(secondError.message)
      }

      router.refresh()
    } catch (error) {
      alert('Failed to reorder announcements.')
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    swapDisplayOrder(announcements[index], announcements[index - 1])
  }

  const handleMoveDown = (index: number) => {
    if (index === announcements.length - 1) return
    swapDisplayOrder(announcements[index], announcements[index + 1])
  }

  return (
    <div className="space-y-8">
      {!showForm && !editingId && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Announcement Line
        </button>
      )}

      {(showForm || editingId) && (
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Announcement Line' : 'Add Announcement Line'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="label">Text (Macedonian)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={formData.text_mk}
                  onChange={(e) => setFormData({ ...formData, text_mk: e.target.value })}
                  placeholder="Нова промоција овој викенд"
                  required
                />
              </div>
              <div>
                <label className="label">Text (English)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={formData.text_en}
                  onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                  placeholder="New weekend promotion"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Line' : 'Create Line'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            No announcement lines yet. Add your first promo line.
          </div>
        )}

        {announcements.map((line, index) => (
          <div
            key={line.id}
            className="bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-neutral-400">Order {line.display_order}</p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest ${
                    line.is_active ? 'text-green-600' : 'text-neutral-400'
                  }`}
                >
                  {line.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">MK:</span> {line.text_mk}
              </p>
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">EN:</span> {line.text_en}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleMoveUp(index)}
                className="btn btn-outline btn-sm"
                disabled={index === 0}
              >
                ↑ Move Up
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                className="btn btn-outline btn-sm"
                disabled={index === announcements.length - 1}
              >
                ↓ Move Down
              </button>
              <button
                onClick={() => handleToggleActive(line.id, line.is_active)}
                className="btn btn-outline btn-sm"
              >
                {line.is_active ? 'Disable' : 'Activate'}
              </button>
              <button
                onClick={() => handleEdit(line)}
                className="btn btn-secondary btn-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(line.id)}
                className="btn btn-outline btn-sm text-primary-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
