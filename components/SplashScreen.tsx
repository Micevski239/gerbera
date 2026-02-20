'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

// Only set to true once animation fully completes
let splashShown = false

export default function SplashScreen() {
  const { language } = useLanguage()
  const [displayed, setDisplayed] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(splashShown)

  const subtitle = language === 'mk' ? 'момент на љубов' : 'a moment of love'

  useEffect(() => {
    if (splashShown) {
      setGone(true)
      return
    }

    let cancelled = false

    const startDelay = setTimeout(() => {
      if (cancelled) return
      let i = 0
      const interval = setInterval(() => {
        if (cancelled) { clearInterval(interval); return }
        i++
        setDisplayed(subtitle.slice(0, i))
        if (i >= subtitle.length) {
          clearInterval(interval)
          if (cancelled) return
          setTypingDone(true)
          setTimeout(() => {
            if (cancelled) return
            setExiting(true)
            setTimeout(() => {
              if (cancelled) return
              splashShown = true
              setGone(true)
            }, 500)
          }, 900)
        }
      }, 55)
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(startDelay)
    }
  }, [subtitle])

  if (gone) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-canvas-100"
      style={{
        opacity: exiting ? 0 : 1,
        transition: exiting ? 'opacity 0.5s ease' : undefined,
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      <div className="text-center select-none">
        <p className="font-heading text-3xl md:text-4xl text-ink-strong tracking-wide mb-2">
          Gerbera
        </p>
        <p className="text-[10px] uppercase tracking-[0.25em] text-ink-muted/50 font-body mt-2">
          {displayed}
          {!typingDone && (
            <span className="inline-block w-px h-3 bg-ink-muted/50 ml-0.5 align-middle animate-blink" />
          )}
        </p>
      </div>
    </div>
  )
}
