import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import type { Testimonial } from '@/lib/supabase/types'
import TestimonialsClient from './TestimonialsClient'

export const dynamic = 'force-dynamic'

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load testimonials', error.message)
    return []
  }

  return data ?? []
}

export default async function TestimonialsAdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  const testimonials = await getTestimonials()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Testimonials</h1>
        <p className="text-neutral-600 mt-2">Manage what customers say on the homepage testimonials section.</p>
      </div>

      <TestimonialsClient testimonials={testimonials} />
    </div>
  )
}
