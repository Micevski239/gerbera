'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { processImage, sanitizeFilename } from '@/lib/utils'
import type { ImageRecord } from './page'

const BUCKET = 'product-images'

interface ProcessingResult {
  label: string
  status: 'success' | 'error'
  message: string
}

export default function ImageOptimizerClient({ images }: { images: ImageRecord[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [currentLabel, setCurrentLabel] = useState('')

  const isStoragePath = (value: string) => !value.startsWith('http')

  const getFullUrl = (value: string) => {
    if (value.startsWith('http')) return value
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${value}`
  }

  const reprocessAll = async () => {
    setProcessing(true)
    setResults([])
    setCurrentIndex(0)

    for (let i = 0; i < images.length; i++) {
      const record = images[i]
      setCurrentIndex(i + 1)
      setCurrentLabel(record.label)

      try {
        const imageUrl = getFullUrl(record.imageValue)
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error(`Неуспешно преземање: ${response.status}`)

        const blob = await response.blob()
        const file = new File([blob], 'image.jpg', { type: blob.type })

        const { full, thumbnail } = await processImage(file, 1200)

        const timestamp = Date.now()
        const safeName = sanitizeFilename(file.name)

        let folder = ''
        if (record.table === 'categories') folder = `categories/${record.id}`
        else if (record.table === 'occasions') folder = `occasions/${record.id}`
        else if (record.table === 'hero_tiles') folder = `hero-tiles/${record.id}`
        else folder = record.id

        const fullPath = `${folder}/${timestamp}-${safeName}`
        const thumbPath = `${folder}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

        const [fullResult, thumbResult] = await Promise.all([
          supabase.storage.from(BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
          supabase.storage.from(BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
        ])

        if (fullResult.error) throw new Error(fullResult.error.message)
        if (thumbResult.error) throw new Error(thumbResult.error.message)

        let newValue: string
        if (isStoragePath(record.imageValue)) {
          newValue = fullPath
        } else {
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(fullPath)
          newValue = data.publicUrl
        }

        const { error: updateError } = await supabase
          .from(record.table)
          .update({ [record.imageField]: newValue } as never)
          .eq('id', record.id)

        if (updateError) throw new Error(updateError.message)

        setResults((prev) => [...prev, { label: record.label, status: 'success', message: 'Конвертирано во WebP + миниатура' }])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Непозната грешка'
        setResults((prev) => [...prev, { label: record.label, status: 'error', message }])
      }
    }

    setProcessing(false)
    setCurrentLabel('')
    router.refresh()
  }

  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-2xl bg-white p-6 shadow-card border border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{images.length}</p>
            <p className="text-sm text-neutral-500">Вкупно слики од сите табели</p>
          </div>
          <button
            onClick={reprocessAll}
            disabled={processing || images.length === 0}
            className="btn btn-primary"
          >
            {processing ? 'Процесирање...' : 'Репроцесирај ги сите'}
          </button>
        </div>

        {processing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Процесирање: {currentLabel}</span>
              <span>{currentIndex} / {images.length}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentIndex / images.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && !processing && (
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-emerald-600 font-medium">{successCount} успешни</span>
            {errorCount > 0 && <span className="text-red-600 font-medium">{errorCount} неуспешни</span>}
          </div>
        )}
      </div>

      {/* Results list */}
      {results.length > 0 && (
        <div className="rounded-2xl bg-white shadow-card border border-neutral-100 overflow-hidden">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-800">Резултати</h2>
          </div>
          <div className="divide-y divide-neutral-100 max-h-96 overflow-auto">
            {results.map((result, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    result.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-neutral-700 flex-1">{result.label}</span>
                <span className={`text-xs ${result.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image inventory */}
      <div className="rounded-2xl bg-white shadow-card border border-neutral-100 overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-800">Инвентар на слики</h2>
        </div>
        <div className="divide-y divide-neutral-100 max-h-96 overflow-auto">
          {images.map((img, idx) => {
            const url = getFullUrl(img.imageValue)
            const isWebp = img.imageValue.endsWith('.webp')
            return (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 flex-shrink-0">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="text-sm text-neutral-700 flex-1">{img.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isWebp ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isWebp ? 'WebP' : 'Не е WebP'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
