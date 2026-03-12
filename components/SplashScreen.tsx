'use client'

import { useState, useEffect } from 'react'

const SUBTITLE = 'Момент на љубов'

export default function SplashScreen() {
  const [subtitleCount, setSubtitleCount] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Start subtitle typing after a brief pause
    const startDelay = setTimeout(() => {
      let j = 0
      const subtitleInterval = setInterval(() => {
        j++
        setSubtitleCount(j)
        if (j >= SUBTITLE.length) clearInterval(subtitleInterval)
      }, 60)
    }, 300)

    const totalTime = 300 + SUBTITLE.length * 60 + 800
    const fadeTimer = setTimeout(() => setFadeOut(true), totalTime)
    const doneTimer = setTimeout(() => setDone(true), totalTime + 600)

    return () => {
      clearTimeout(startDelay)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (done) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-canvas-100 transition-opacity duration-[600ms] ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center leading-none">
        <span className="font-heading text-2xl md:text-3xl tracking-wide text-ink-strong">
          Gerbera
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-ink-muted font-body mt-1 relative">
          {/* Invisible full text to reserve width */}
          <span className="invisible">{SUBTITLE}</span>
          {/* Visible typed text overlaid on top */}
          <span className="absolute left-0 top-0">
            {SUBTITLE.slice(0, subtitleCount)}
            {subtitleCount < SUBTITLE.length && (
              <span className="inline-block w-[1px] h-[1em] bg-ink-muted align-baseline ml-0.5 animate-pulse" />
            )}
          </span>
        </span>
      </div>
    </div>
  )
}
