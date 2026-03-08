# Homepage Scroll Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add scroll-triggered reveal animations, staggered grids, header scroll transitions, and reduced-motion accessibility to the Gerbera homepage.

**Architecture:** A `useScrollReveal` hook wraps IntersectionObserver. A `<ScrollReveal>` component uses it to animate children on viewport entry with CSS transitions. Header gets scroll-direction awareness for hide/show and transparent-to-solid on homepage. Global CSS handles reduced-motion.

**Tech Stack:** React 19 hooks, IntersectionObserver API, CSS transitions, Tailwind CSS

---

### Task 1: Create `useScrollReveal` hook

**Files:**
- Create: `hooks/useScrollReveal.ts`

**Step 1: Create the hook file**

```ts
'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
}: UseScrollRevealOptions = {}) {
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
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors related to useScrollReveal.ts

---

### Task 2: Create `<ScrollReveal>` component

**Files:**
- Create: `components/ScrollReveal.tsx`

**Step 1: Create the component**

```tsx
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
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors related to ScrollReveal.tsx

---

### Task 3: Wire up homepage sections with ScrollReveal

**Files:**
- Modify: `app/(public)/HomePageClient.tsx`

**Step 1: Replace all `animate-slide-up` wrappers**

Replace the current pattern:
```tsx
<div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
  <HeroBentoGrid ... />
</div>
```

With ScrollReveal wrappers. The hero stays unwrapped (above fold). All other sections get `<ScrollReveal>`:

```tsx
import ScrollReveal from '@/components/ScrollReveal'

// Hero — NO animation (above fold, visible immediately)
<HeroBentoGrid heroTiles={heroTiles} categories={categories} language={language} />

// OccasionShowcase
<ScrollReveal>
  <OccasionShowcase language={language} occasions={occasions} />
</ScrollReveal>

// Info Banner
<ScrollReveal>
  <section className="bg-softPink">...</section>
</ScrollReveal>

// New Collection
<ScrollReveal>
  <NewCollectionSection ... />
</ScrollReveal>

// Testimonials
<ScrollReveal>
  <TestimonialsShowcase language={language} />
</ScrollReveal>
```

**Step 2: Verify dev server renders correctly**

Run: `npm run dev`
Expected: Sections fade-up as they scroll into view. Hero is immediately visible.

---

### Task 4: Add staggered animations to OccasionShowcase

**Files:**
- Modify: `components/sections/OccasionShowcase.tsx`

**Step 1: Wrap the occasion cards grid with ScrollReveal**

```tsx
import ScrollReveal from '@/components/ScrollReveal'

// Wrap the flex container of cards:
<ScrollReveal
  stagger={100}
  className="flex flex-wrap justify-center gap-6 sm:gap-8"
>
  {occasions.map((occasion) => (
    <OccasionCard key={occasion.id} occasion={occasion} language={language} />
  ))}
</ScrollReveal>
```

Remove the outer `<div className="flex flex-wrap justify-center gap-6 sm:gap-8">` since ScrollReveal replaces it.

**Step 2: Verify stagger works**

Expected: Occasion cards animate in one by one with 100ms gaps.

---

### Task 5: Add staggered animations to NewCollectionSection product grid

**Files:**
- Modify: `app/(public)/HomePageClient.tsx` (NewCollectionSection function)

**Step 1: Wrap the product grid with ScrollReveal**

In the `NewCollectionSection` component, wrap the grid:

```tsx
import ScrollReveal from '@/components/ScrollReveal'

// Replace the grid div:
<ScrollReveal
  stagger={80}
  className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
>
  {products.slice(0, 8).map((product) => (
    <ProductCard key={product.id} product={product} variant="shop" />
  ))}
</ScrollReveal>
```

**Step 2: Verify stagger works**

Expected: Product cards animate in sequentially with 80ms gaps.

---

### Task 6: Add staggered animations to TestimonialsShowcase

**Files:**
- Modify: `components/sections/TestimonialsShowcase.tsx`

**Step 1: Wrap the testimonials grid with ScrollReveal**

```tsx
import ScrollReveal from '@/components/ScrollReveal'

// Replace the grid div:
<ScrollReveal
  stagger={80}
  className="grid grid-cols-2 lg:grid-cols-5 gap-0"
>
  {testimonials.map((t, i) => (
    // ... existing testimonial card JSX
  ))}
</ScrollReveal>
```

Remove the outer `<div className="grid grid-cols-2 lg:grid-cols-5 gap-0">` since ScrollReveal replaces it.

**Step 2: Verify stagger works**

Expected: Testimonial cards animate in with 80ms stagger.

---

### Task 7: Add header scroll transitions (homepage only)

**Files:**
- Modify: `components/Header.tsx`

**Step 1: Add scroll state tracking**

Add a `useEffect` that tracks:
- `scrollY > 80` → `isScrolled = true` (transparent → solid)
- Scroll direction → `isHidden` (hide on scroll-down, show on scroll-up)
- Only apply transparent mode when `pathname === '/'`

```tsx
const [isScrolled, setIsScrolled] = useState(false)
const [isHidden, setIsHidden] = useState(false)
const lastScrollY = useRef(0)
const isHome = pathname === '/'

useEffect(() => {
  const onScroll = () => {
    const currentY = window.scrollY

    // Transparent → solid after 80px
    setIsScrolled(currentY > 80)

    // Hide on scroll-down, show on scroll-up (only after hero)
    if (currentY > 200) {
      setIsHidden(currentY > lastScrollY.current && currentY - lastScrollY.current > 5)
    } else {
      setIsHidden(false)
    }

    lastScrollY.current = currentY
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

**Step 2: Update header classes**

Replace the static `<header>` className with dynamic classes:

```tsx
<header
  className={`sticky top-0 z-50 transition-all duration-300 ${
    isHidden ? '-translate-y-full' : 'translate-y-0'
  } ${
    isHome && !isScrolled
      ? 'bg-transparent border-transparent'
      : 'bg-white border-b border-border-soft'
  }`}
>
```

**Step 3: Update text/icon colors for transparent state**

When `isHome && !isScrolled`, nav links and icons should be white. When scrolled or not on homepage, keep current dark colors.

Add a helper:
```tsx
const textColor = isHome && !isScrolled ? 'text-white' : 'text-ink-muted'
const textColorStrong = isHome && !isScrolled ? 'text-white' : 'text-ink-strong'
```

Apply to logo, nav links, social icons, and mobile menu button.

**Step 4: Verify behavior**

Expected:
- On homepage: header starts transparent with white text, becomes solid white after 80px scroll
- Header hides on scroll-down past 200px, reappears on scroll-up
- On other pages: header is always solid white (existing behavior)

---

### Task 8: Add `prefers-reduced-motion` support

**Files:**
- Modify: `app/globals.css`

**Step 1: Add the reduced-motion media query at the end of the file**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 2: Verify**

In Chrome DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce"
Expected: All animations and transitions are effectively instant.

---

### Task 9: Verify and commit

**Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Test in browser**

- Homepage: sections reveal on scroll, header transitions, staggered grids
- Other pages: header behaves as before (solid white, no hide/show)
- Reduced motion: all animations disabled

**Step 4: Commit**

```bash
git add hooks/useScrollReveal.ts components/ScrollReveal.tsx app/\(public\)/HomePageClient.tsx components/Header.tsx components/sections/OccasionShowcase.tsx components/sections/TestimonialsShowcase.tsx app/globals.css
git commit -m "feat: add scroll-triggered reveal animations to homepage"
```
