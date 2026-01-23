'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
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

export default function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const defaultForms = useMemo(() => {
    const map: Record<string, TestimonialFormState> = {}
    testimonials.forEach((testimonial) => {
      map[testimonial.id] = {
        customer_name: testimonial.customer_name,
        customer_location_mk: testimonial.customer_location_mk || '',
        customer_location_en: testimonial.customer_location_en || '',
        content_mk: testimonial.content_mk,
        content_en: testimonial.content_en,
        rating: testimonial.rating,
        avatar_path: testimonial.avatar_path || '',
        is_featured: testimonial.is_featured,
        is_active: testimonial.is_active,
      }
    })
    return map
  }, [testimonials])

  const [forms, setForms] = useState<Record<string, TestimonialFormState>>(defaultForms)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [newTestimonial, setNewTestimonial] = useState<TestimonialFormState>({
    customer_name: '',
    customer_location_mk: '',
    customer_location_en: '',
    content_mk: '',
    content_en: '',
    rating: 5,
    avatar_path: '',
    is_featured: false,
    is_active: true,
  })

  const handleChange = (id: string, field: keyof TestimonialFormState, value: string | number | boolean) => {
    setForms((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
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
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save testimonial.')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete testimonial.')
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTestimonial.customer_name.trim() || !newTestimonial.content_mk.trim() || !newTestimonial.content_en.trim()) {
      alert('Name and content are required.')
      return
    }
    setCreating(true)
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
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
      setNewTestimonial({
        customer_name: '',
        customer_location_mk: '',
        customer_location_en: '',
        content_mk: '',
        content_en: '',
        rating: 5,
        avatar_path: '',
        is_featured: false,
        is_active: true,
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create testimonial.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-4 rounded-2xl bg-white p-6 shadow-card border border-neutral-100">
        <h2 className="text-xl font-semibold text-neutral-800">Add Testimonial</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Customer Name</label>
            <input className="input" value={newTestimonial.customer_name} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, customer_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Avatar URL</label>
            <input className="input" value={newTestimonial.avatar_path} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, avatar_path: e.target.value }))} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Location (MK)</label>
            <input className="input" value={newTestimonial.customer_location_mk} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, customer_location_mk: e.target.value }))} />
          </div>
          <div>
            <label className="label">Location (EN)</label>
            <input className="input" value={newTestimonial.customer_location_en} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, customer_location_en: e.target.value }))} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Quote (MK)</label>
            <textarea className="input min-h-[100px]" value={newTestimonial.content_mk} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, content_mk: e.target.value }))} />
          </div>
          <div>
            <label className="label">Quote (EN)</label>
            <textarea className="input min-h-[100px]" value={newTestimonial.content_en} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, content_en: e.target.value }))} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Rating</label>
            <input type="number" min={1} max={5} className="input" value={newTestimonial.rating} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, rating: Number(e.target.value) }))} />
          </div>
          <label className="label flex items-center gap-2">
            <input type="checkbox" checked={newTestimonial.is_featured} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, is_featured: e.target.checked }))} />
            Featured
          </label>
          <label className="label flex items-center gap-2">
            <input type="checkbox" checked={newTestimonial.is_active} onChange={(e) => setNewTestimonial((prev) => ({ ...prev, is_active: e.target.checked }))} />
            Visible
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Saving…' : 'Create testimonial'}
        </button>
      </form>

      <div className="space-y-6">
        {testimonials.map((testimonial) => {
          const form = forms[testimonial.id]
          if (!form) return null
          return (
            <div key={testimonial.id} className="rounded-2xl bg-white border border-neutral-100 shadow-card p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-neutral-100">
                  {form.avatar_path ? (
                    <Image src={form.avatar_path} alt={form.customer_name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">No image</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{form.customer_name}</p>
                  <p className="text-xs text-neutral-500">{form.customer_location_en || form.customer_location_mk || ''}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Name</label>
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

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="label">Rating</label>
                  <input type="number" min={1} max={5} className="input" value={form.rating} onChange={(e) => handleChange(testimonial.id, 'rating', Number(e.target.value))} />
                </div>
                <label className="label flex items-center gap-2">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange(testimonial.id, 'is_featured', e.target.checked)} />
                  Featured
                </label>
                <label className="label flex items-center gap-2">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange(testimonial.id, 'is_active', e.target.checked)} />
                  Visible
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={() => handleSave(testimonial.id)} disabled={savingId === testimonial.id}>
                  {savingId === testimonial.id ? 'Saving…' : 'Save changes'}
                </button>
                <button className="btn btn-danger" type="button" onClick={() => handleDelete(testimonial.id)}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}

        {testimonials.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-neutral-500">
            No testimonials yet. Use the form above to add your first client story.
          </div>
        )}
      </div>
    </div>
  )
}
