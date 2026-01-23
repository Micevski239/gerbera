'use client'

import SectionList from './SectionList'
import { useSections } from '@/hooks/useSections'
import type { Language } from '@/lib/supabase/types'
import type { SectionWithProducts } from '@/types/sections'

interface DynamicSectionsProps {
  language: Language
  sections?: SectionWithProducts[]
}

export default function DynamicSections({ language, sections: prefetchedSections }: DynamicSectionsProps) {
  const shouldFetch = !prefetchedSections
  const { sections, loading, error } = useSections({
    initialSections: prefetchedSections,
    enabled: shouldFetch,
  })
  const resolvedSections = prefetchedSections ?? sections

  if (shouldFetch && error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load sections right now. Please try again later.
      </div>
    )
  }

  if (shouldFetch && loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="rounded-3xl border border-neutral-100 bg-white/80 p-6 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded-full bg-neutral-100" />
            <div className="mt-6 flex gap-4 overflow-hidden">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="h-32 w-32 animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (resolvedSections.length === 0) {
    return null
  }

  return <SectionList sections={resolvedSections} language={language} />
}
