'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/lib/supabase/types'

interface TestimonialFormState {
  customer_name: string
  customer_location_mk: string
  customer_location_en: string
  content_mk: string
  content_en: string
  rating: number
  avatar_path: string
  is_featured: boolean
  is_active: boolean
}

interface TestimonialsClientProps {
  testimonials: Testimonial[]
}

const EMPTY_FORM: TestimonialFormState = {
  customer_name: '',
  customer_location_mk: '',
  customer_location_en: '',
  content_mk: '',
  content_en: '',
  rating: 5,
  avatar_path: '',
  is_featured: false,
  is_active: true,
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400' : 'text-neutral-200'} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const defaultForms = useMemo(() => {
    const map: Record<string, TestimonialFormState> = {}
    testimonials.forEach((t) => {
      map[t.id] = {
        customer_name: t.customer_name,
        customer_location_mk: t.customer_location_mk || '',
        customer_location_en: t.customer_location_en || '',
        content_mk: t.content_mk,
        content_en: t.content_en || '',
        rating: t.rating,
        avatar_path: t.avatar_path || '',
        is_featured: t.is_featured,
        is_active: t.is_active,
      }
    })
    return map
  }, [testimonials])

  const [forms, setForms] = useState<Record<string, TestimonialFormState>>(defaultForms)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTestimonial, setNewTestimonial] = useState<TestimonialFormState>(EMPTY_FORM)

  const handleChange = (id: string, field: keyof TestimonialFormState, value: string | number | boolean) => {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSave = async (id: string) => {
    const form = forms[id]
    if (!form) return
    if (!form.customer_name.trim() || !form.content_mk.trim() || !form.content_en.trim()) {
      alert('Name and both content fields are required.')
      return
    }
    setSavingId(id)
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          customer_name: form.customer_name.trim(),
          customer_location_mk: form.customer_location_mk.trim() || null,
          customer_location_en: form.customer_location_en.trim() || null,
          content_mk: form.content_mk.trim(),
          content_en: form.content_en.trim(),
          rating: form.rating,
          avatar_path: form.avatar_path.trim() || null,
          is_featured: form.is_featured,
          is_active: form.is_active,
        } as never)
        .eq('id', id)
      if (error) throw new Error(error.message)
      setExpandedId(null)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to save testimonial.')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) throw new Error(error.message)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete testimonial.')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTestimonial.customer_name.trim() || !newTestimonial.content_mk.trim() || !newTestimonial.content_en.trim()) {
      alert('Name and content are required.')
      return
    }
    setCreating(true)
    try {
      const { error } = await supabase.from('testimonials').insert({
        customer_name: newTestimonial.customer_name.trim(),
        customer_location_mk: newTestimonial.customer_location_mk.trim() || null,
        customer_location_en: newTestimonial.customer_location_en.trim() || null,
        content_mk: newTestimonial.content_mk.trim(),
        content_en: newTestimonial.content_en.trim(),
        rating: newTestimonial.rating,
        avatar_path: newTestimonial.avatar_path.trim() || null,
        is_featured: newTestimonial.is_featured,
        is_active: newTestimonial.is_active,
      } as never)
      if (error) throw new Error(error.message)
      setNewTestimonial(EMPTY_FORM)
      setShowAddForm(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to create testimonial.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new */}
      <div className="rounded-2xl bg-white border border-neutral-100 shadow-card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
        >
          <span className="font-semibold text-neutral-800">Add testimonial</span>
          <svg
            className={`h-5 w-5 text-neutral-400 transition-transform ${showAddForm ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAddForm && (
          <form onSubmit={handleCreate} className="border-t border-neutral-100 px-6 pb-6 pt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Customer Name</label>
                <input className="input" value={newTestimonial.customer_name} onChange={(e) => setNewTestimonial((p) => ({ ...p, customer_name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Avatar URL</label>
                <input className="input" value={newTestimonial.avatar_path} onChange={(e) => setNewTestimonial((p) => ({ ...p, avatar_path: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Location (MK)</label>
                <input className="input" value={newTestimonial.customer_location_mk} onChange={(e) => setNewTestimonial((p) => ({ ...p, customer_location_mk: e.target.value }))} />
              </div>
              <div>
                <label className="label">Location (EN)</label>
                <input className="input" value={newTestimonial.customer_location_en} onChange={(e) => setNewTestimonial((p) => ({ ...p, customer_location_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Quote (MK)</label>
                <textarea className="input min-h-[100px]" value={newTestimonial.content_mk} onChange={(e) => setNewTestimonial((p) => ({ ...p, content_mk: e.target.value }))} />
              </div>
              <div>
                <label className="label">Quote (EN)</label>
                <textarea className="input min-h-[100px]" value={newTestimonial.content_en} onChange={(e) => setNewTestimonial((p) => ({ ...p, content_en: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="w-24">
                <label className="label">Rating</label>
                <input type="number" min={1} max={5} className="input" value={newTestimonial.rating} onChange={(e) => setNewTestimonial((p) => ({ ...p, rating: Number(e.target.value) }))} />
              </div>
              <label className="label flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newTestimonial.is_featured} onChange={(e) => setNewTestimonial((p) => ({ ...p, is_featured: e.target.checked }))} />
                Featured
              </label>
              <label className="label flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newTestimonial.is_active} onChange={(e) => setNewTestimonial((p) => ({ ...p, is_active: e.target.checked }))} />
                Visible
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Saving…' : 'Create testimonial'}
              </button>
              <button type="button" className="btn" onClick={() => { setShowAddForm(false); setNewTestimonial(EMPTY_FORM) }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Testimonial list */}
      <div className="space-y-3">
        {testimonials.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500">
            No testimonials yet. Use the form above to add your first client story.
          </div>
        )}

        {testimonials.map((testimonial) => {
          const form = forms[testimonial.id]
          if (!form) return null
          const isOpen = expandedId === testimonial.id

          return (
            <div key={testimonial.id} className="rounded-2xl bg-white border border-neutral-100 shadow-card overflow-hidden">
              {/* Collapsed row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Avatar initials */}
                <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-neutral-500">
                  {form.customer_name.charAt(0).toUpperCase() || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{form.customer_name}</p>
                  <p className="text-xs text-neutral-400 truncate">{form.customer_location_en || form.customer_location_mk || '—'}</p>
                </div>

                <StarRating rating={form.rating} />

                <div className="hidden sm:flex items-center gap-2">
                  {form.is_featured && (
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">Featured</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${form.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
                    {form.is_active ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : testimonial.id)}
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isOpen ? 'Close' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded edit form */}
              {isOpen && (
                <div className="border-t border-neutral-100 px-5 pb-5 pt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Customer Name</label>
                      <input className="input" value={form.customer_name} onChange={(e) => handleChange(testimonial.id, 'customer_name', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Avatar URL</label>
                      <input className="input" value={form.avatar_path} onChange={(e) => handleChange(testimonial.id, 'avatar_path', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Location (MK)</label>
                      <input className="input" value={form.customer_location_mk} onChange={(e) => handleChange(testimonial.id, 'customer_location_mk', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Location (EN)</label>
                      <input className="input" value={form.customer_location_en} onChange={(e) => handleChange(testimonial.id, 'customer_location_en', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Quote (MK)</label>
                      <textarea className="input min-h-[100px]" value={form.content_mk} onChange={(e) => handleChange(testimonial.id, 'content_mk', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Quote (EN)</label>
                      <textarea className="input min-h-[100px]" value={form.content_en} onChange={(e) => handleChange(testimonial.id, 'content_en', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="w-24">
                      <label className="label">Rating</label>
                      <input type="number" min={1} max={5} className="input" value={form.rating} onChange={(e) => handleChange(testimonial.id, 'rating', Number(e.target.value))} />
                    </div>
                    <label className="label flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange(testimonial.id, 'is_featured', e.target.checked)} />
                      Featured
                    </label>
                    <label className="label flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange(testimonial.id, 'is_active', e.target.checked)} />
                      Visible
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSave(testimonial.id)}
                      disabled={savingId === testimonial.id}
                    >
                      {savingId === testimonial.id ? 'Saving…' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setExpandedId(null)}
                    >
                      Cancel
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
