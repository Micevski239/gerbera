'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getOrCreateVisitorId(): string {
  const key = 'gerbera_visitor_id'
  let id = document.cookie
    .split('; ')
    .find((c) => c.startsWith(key + '='))
    ?.split('=')[1]

  if (!id) {
    id = crypto.randomUUID()
    // Set cookie for 1 year
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${key}=${id}; path=/; expires=${expires}; SameSite=Lax`
  }

  return id
}

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith('/admin')) return
    // Skip if we already tracked this path in this navigation
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    const visitorId = getOrCreateVisitorId()
    const supabase = createClient()

    supabase
      .from('page_views')
      .insert({
        visitor_id: visitorId,
        page_path: pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      })
      .then(({ error }) => {
        if (error) console.error('Failed to track page view:', error.message)
      })
  }, [pathname])

  return null
}
