'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal({
  threshold = 0.05,
  rootMargin,
  triggerOnce = true,
}: UseScrollRevealOptions = {}) {
  // On mobile (< 768px) trigger earlier so there's less white space
  const defaultRootMargin = typeof window !== 'undefined' && window.innerWidth < 768
    ? '0px 0px 0px 0px'
    : '0px 0px -50px 0px'
  const resolvedRootMargin = rootMargin ?? defaultRootMargin
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) observer.unobserve(el)
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: resolvedRootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, resolvedRootMargin, triggerOnce])

  return { ref, isVisible }
}
