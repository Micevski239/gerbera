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
  })

  const resetForm = () => {
    setFormData({ text_mk: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.text_mk.trim()) return

    setSaving(true)
    try {
      const supabase = createClient()

      if (editingId) {
        const updateData: AnnouncementLineUpdate = {
          text_mk: formData.text_mk,
        }

        const { error } = await supabase
          .from('announcement_lines')
          .update(updateData as never)
          .eq('id', editingId)

        if (error) {
          alert('Неуспешно ажурирање на најавата: ' + error.message)
          setSaving(false)
          return
        }
      } else {
        const insertData: AnnouncementLineInsert = {
          text_mk: formData.text_mk,
          display_order: announcements.length * 10,
        }

        const { error } = await supabase
          .from('announcement_lines')
          .insert(insertData as never)

        if (error) {
          alert('Неуспешно додавање на најавата: ' + error.message)
          setSaving(false)
          return
        }
      }

      resetForm()
      router.refresh()
    } catch (error) {
      alert('Настана неочекувана грешка при зачувување на најавата.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (line: AnnouncementLine) => {
    setEditingId(line.id)
    setFormData({ text_mk: line.text_mk })
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Избриши ја оваа најава?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcement_lines')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Неуспешно бришење на најавата: ' + error.message)
        return
      }

      router.refresh()
    } catch (error) {
      alert('Настана неочекувана грешка при бришење на најавата.')
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
        alert('Неуспешна промена на статусот: ' + error.message)
        return
      }

      router.refresh()
    } catch (error) {
      alert('Настана неочекувана грешка при ажурирање на статусот.')
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
      alert('Неуспешно преместување на најавите.')
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
          Додај најава
        </button>
      )}

      {(showForm || editingId) && (
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Уреди најава' : 'Додај најава'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Текст</label>
              <textarea
                className="textarea"
                rows={3}
                value={formData.text_mk}
                onChange={(e) => setFormData({ ...formData, text_mk: e.target.value })}
                placeholder="Нова промоција овој викенд"
                required
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Зачувување...' : editingId ? 'Ажурирај' : 'Креирај'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Откажи
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            Нема најави. Додајте ја вашата прва промо порака.
          </div>
        )}

        {announcements.map((line, index) => (
          <div
            key={line.id}
            className="bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-neutral-400">Редослед {line.display_order}</p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest ${
                    line.is_active ? 'text-green-600' : 'text-neutral-400'
                  }`}
                >
                  {line.is_active ? 'Активна' : 'Скриена'}
                </span>
              </div>
              <p className="text-sm text-neutral-700">{line.text_mk}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleMoveUp(index)}
                className="btn btn-outline btn-sm"
                disabled={index === 0}
              >
                ↑ Горе
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                className="btn btn-outline btn-sm"
                disabled={index === announcements.length - 1}
              >
                ↓ Долу
              </button>
              <button
                onClick={() => handleToggleActive(line.id, line.is_active)}
                className="btn btn-outline btn-sm"
              >
                {line.is_active ? 'Деактивирај' : 'Активирај'}
              </button>
              <button
                onClick={() => handleEdit(line)}
                className="btn btn-secondary btn-sm"
              >
                Уреди
              </button>
              <button
                onClick={() => handleDelete(line.id)}
                className="btn btn-outline btn-sm text-primary-600"
              >
                Избриши
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
