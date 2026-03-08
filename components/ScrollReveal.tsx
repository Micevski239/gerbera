'use client'

import { Children, cloneElement, isValidElement, type ReactNode, type CSSProperties } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

type Animation = 'fade-up' | 'fade-in' | 'scale-in'

interface ScrollRevealProps {
  children: ReactNode
  animation?: Animation
  delay?: number
  duration?: number
  stagger?: number
  className?: string
  as?: 'div' | 'section'
  threshold?: number
  rootMargin?: string
}

const INITIAL_STYLES: Record<Animation, CSSProperties> = {
  'fade-up': { opacity: 0, transform: 'translateY(24px)' },
  'fade-in': { opacity: 0 },
  'scale-in': { opacity: 0, transform: 'scale(0.95)' },
}

const VISIBLE_STYLES: Record<Animation, CSSProperties> = {
  'fade-up': { opacity: 1, transform: 'translateY(0)' },
  'fade-in': { opacity: 1 },
  'scale-in': { opacity: 1, transform: 'scale(1)' },
}

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  stagger,
  className,
  as: Tag = 'div',
  threshold,
  rootMargin,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, rootMargin })

  const baseTransition = `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`

  // Staggered mode: each child gets an incremental delay
  if (stagger) {
    const items = Children.toArray(children)
    return (
      <Tag ref={ref} className={className}>
        {items.map((child, i) => {
          if (!isValidElement(child)) return child
          const itemDelay = delay + Math.min(i, 7) * stagger
          const style: CSSProperties = {
            ...(isVisible ? VISIBLE_STYLES[animation] : INITIAL_STYLES[animation]),
            transition: baseTransition,
            transitionDelay: `${itemDelay}ms`,
          }
          return cloneElement(child as React.ReactElement<{ style?: CSSProperties }>, {
            style: { ...((child as React.ReactElement<{ style?: CSSProperties }>).props.style || {}), ...style },
          })
        })}
      </Tag>
    )
  }

  // Non-staggered mode: animate the wrapper
  const style: CSSProperties = {
    ...(isVisible ? VISIBLE_STYLES[animation] : INITIAL_STYLES[animation]),
    transition: baseTransition,
    transitionDelay: delay ? `${delay}ms` : undefined,
  }

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}
