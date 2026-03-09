# Image Thumbnail & WebP System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert all image uploads to WebP with auto-generated thumbnails, and add an Image Optimizer admin page to reprocess existing images.

**Architecture:** Client-side Canvas processing. `compressImage()` becomes `processImage()` returning `{ full: File, thumbnail: File }` both as WebP. A `getThumbnailUrl()` utility derives thumbnail paths. No DB schema changes — thumbnail URLs are derived from full URLs via suffix convention (`_thumb`).

**Tech Stack:** Next.js 15, Canvas API, Supabase Storage, TypeScript

---

### Task 1: Update `lib/utils.ts` — Core Image Processing

**Files:**
- Modify: `lib/utils.ts:28-91`

**Step 1: Replace `compressImage()` with `processImage()` and add `getThumbnailUrl()`**

Replace the `compressImage` function and `sanitizeFilename`, and add `getThumbnailUrl`. The new `processImage()` returns both a full-size WebP and a thumbnail WebP. `sanitizeFilename` is updated to always produce `.webp` extension. `getThumbnailUrl` derives the thumbnail URL from the full URL.

```typescript
// Replace lines 36-91 of lib/utils.ts with:

// Sanitize filename for storage paths — always outputs .webp extension
export function sanitizeFilename(filename: string): string {
  const safeName = filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
  return `${safeName}.webp`
}

// Convert a canvas to a WebP File
function canvasToWebpFile(canvas: HTMLCanvasElement, name: string, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(new File([blob!], name, { type: 'image/webp', lastModified: Date.now() }))
      },
      'image/webp',
      quality
    )
  })
}

// Process image: returns full-size WebP + thumbnail WebP
export async function processImage(
  file: File,
  maxWidth = 1200,
  thumbMaxWidth = 400
): Promise<{ full: File; thumbnail: File }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = async () => {
        // Full-size
        const fullCanvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        fullCanvas.width = width
        fullCanvas.height = height
        fullCanvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

        // Thumbnail
        const thumbCanvas = document.createElement('canvas')
        let tw = img.width
        let th = img.height
        if (tw > thumbMaxWidth) {
          th = (th * thumbMaxWidth) / tw
          tw = thumbMaxWidth
        }
        thumbCanvas.width = tw
        thumbCanvas.height = th
        thumbCanvas.getContext('2d')!.drawImage(img, 0, 0, tw, th)

        const baseName = sanitizeFilename(file.name)
        const thumbName = baseName.replace('.webp', '_thumb.webp')

        const [full, thumbnail] = await Promise.all([
          canvasToWebpFile(fullCanvas, baseName),
          canvasToWebpFile(thumbCanvas, thumbName),
        ])

        resolve({ full, thumbnail })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Keep compressImage as a thin wrapper for backward compat during migration
export async function compressImage(file: File, maxWidth = 1200): Promise<File> {
  const { full } = await processImage(file, maxWidth)
  return full
}

// Derive thumbnail URL from full image URL
// e.g. "https://...storage/image.webp" -> "https://...storage/image_thumb.webp"
export function getThumbnailUrl(url: string | null): string | null {
  if (!url) return null
  // Only works for .webp URLs
  if (url.endsWith('.webp')) {
    return url.replace('.webp', '_thumb.webp')
  }
  // For non-webp URLs (legacy), return as-is
  return url
}
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`
Expected: No errors related to utils.ts

**Step 3: Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add processImage() for WebP conversion with thumbnail generation"
```

---

### Task 2: Update ProductsClient Upload to Use `processImage()`

**Files:**
- Modify: `app/admin/products/ProductsClient.tsx:6,135-154`

**Step 1: Update import and upload function**

Change the import from `compressImage` to `processImage`, and update `uploadProductImage` to upload both full and thumbnail.

In the import (line 6), replace `compressImage` with `processImage`:
```typescript
import { processImage, isImageFile, sanitizeFilename } from '@/lib/utils'
```

Replace `uploadProductImage` function (lines 135-154):
```typescript
  const uploadProductImage = async (file: File, productId: string | null) => {
    if (!isImageFile(file)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed.')
    }
    const { full, thumbnail } = await processImage(file, 1200)
    const safeName = sanitizeFilename(file.name)
    const prefix = productId ?? 'new'
    const timestamp = Date.now()
    const fullPath = `${prefix}/${timestamp}-${safeName}`
    const thumbPath = `${prefix}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

    const [fullResult, thumbResult] = await Promise.all([
      supabase.storage.from(PRODUCT_BUCKET).upload(fullPath, full, {
        cacheControl: '3600',
        upsert: true,
      }),
      supabase.storage.from(PRODUCT_BUCKET).upload(thumbPath, thumbnail, {
        cacheControl: '3600',
        upsert: true,
      }),
    ])

    if (fullResult.error) throw new Error(fullResult.error.message)
    if (thumbResult.error) throw new Error(thumbResult.error.message)

    const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(fullPath)
    return data.publicUrl
  }
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add app/admin/products/ProductsClient.tsx
git commit -m "feat: product uploads now generate WebP + thumbnail"
```

---

### Task 3: Update CategoriesClient Upload

**Files:**
- Modify: `app/admin/categories/CategoriesClient.tsx:7,101-119`

**Step 1: Update import and upload function**

Change import (line 7) — replace `compressImage` with `processImage`:
```typescript
import { processImage, slugify, isImageFile, sanitizeFilename } from '@/lib/utils'
```

Replace `uploadCategoryImage` function (lines 101-119):
```typescript
  const uploadCategoryImage = async (categoryId: string | null, file: File) => {
    if (!isImageFile(file)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed.')
    }
    const { full, thumbnail } = await processImage(file, 1200)
    const safeName = sanitizeFilename(file.name)
    const prefix = categoryId ?? 'new'
    const timestamp = Date.now()
    const fullPath = `${CATEGORY_FOLDER}/${prefix}/${timestamp}-${safeName}`
    const thumbPath = `${CATEGORY_FOLDER}/${prefix}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

    const [fullResult, thumbResult] = await Promise.all([
      supabase.storage.from(CATEGORY_BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
      supabase.storage.from(CATEGORY_BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
    ])

    if (fullResult.error) throw new Error(fullResult.error.message)
    if (thumbResult.error) throw new Error(thumbResult.error.message)

    return fullPath
  }
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add app/admin/categories/CategoriesClient.tsx
git commit -m "feat: category uploads now generate WebP + thumbnail"
```

---

### Task 4: Update OccasionsClient Upload

**Files:**
- Modify: `app/admin/occasions/OccasionsClient.tsx:7,104-122`

**Step 1: Update import and upload function**

Change import (line 7) — replace `compressImage` with `processImage`:
```typescript
import { processImage, slugify, isImageFile, sanitizeFilename } from '@/lib/utils'
```

Replace `uploadOccasionImage` function (lines 104-122):
```typescript
  const uploadOccasionImage = async (occasionId: string | null, file: File) => {
    if (!isImageFile(file)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed.')
    }
    const { full, thumbnail } = await processImage(file, 1200)
    const safeName = sanitizeFilename(file.name)
    const prefix = occasionId ?? 'new'
    const timestamp = Date.now()
    const fullPath = `${OCCASION_FOLDER}/${prefix}/${timestamp}-${safeName}`
    const thumbPath = `${OCCASION_FOLDER}/${prefix}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

    const [fullResult, thumbResult] = await Promise.all([
      supabase.storage.from(OCCASION_BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
      supabase.storage.from(OCCASION_BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
    ])

    if (fullResult.error) throw new Error(fullResult.error.message)
    if (thumbResult.error) throw new Error(thumbResult.error.message)

    return fullPath
  }
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add app/admin/occasions/OccasionsClient.tsx
git commit -m "feat: occasion uploads now generate WebP + thumbnail"
```

---

### Task 5: Update HeroTilesClient Upload

**Files:**
- Modify: `app/admin/hero-tiles/HeroTilesClient.tsx:7,137-155`

**Step 1: Update import and upload function**

Change import (line 7) — replace `compressImage` with `processImage`:
```typescript
import { processImage, isImageFile, sanitizeFilename } from '@/lib/utils'
```

Replace `uploadTileImage` function (lines 137-155):
```typescript
  const uploadTileImage = async (slot: HeroTileSlot, file: File) => {
    if (!isImageFile(file)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed.')
    }
    const { full, thumbnail } = await processImage(file, 1200)
    const safeName = sanitizeFilename(file.name)
    const timestamp = Date.now()
    const fullPath = `hero-tiles/${slot}/${timestamp}-${safeName}`
    const thumbPath = `hero-tiles/${slot}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

    const [fullResult, thumbResult] = await Promise.all([
      supabase.storage.from(HERO_TILE_BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
      supabase.storage.from(HERO_TILE_BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
    ])

    if (fullResult.error) throw new Error(fullResult.error.message)
    if (thumbResult.error) throw new Error(thumbResult.error.message)

    const { data } = supabase.storage.from(HERO_TILE_BUCKET).getPublicUrl(fullPath)
    return data.publicUrl
  }
```

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add app/admin/hero-tiles/HeroTilesClient.tsx
git commit -m "feat: hero tile uploads now generate WebP + thumbnail"
```

---

### Task 6: Use Thumbnails in ProductCard

**Files:**
- Modify: `components/ProductCard.tsx:5,38-40`

**Step 1: Import `getThumbnailUrl` and use it for card image variants**

Add `getThumbnailUrl` to the import from `@/lib/supabase/client` — wait, `getThumbnailUrl` is in `lib/utils.ts`. Update the import:

Add to the existing imports (after line 5):
```typescript
import { getThumbnailUrl } from '@/lib/utils'
```

After line 40, add a thumbnail URL derivation:
```typescript
  const thumbUrl = getThumbnailUrl(imageUrl)
```

Then in the following variants, replace `imageUrl` with `thumbUrl` for the `<Image>` `src` prop:
- **shop variant** (line 167): `src={thumbUrl || imageUrl}` — these are card-size images
- **mini variant** (line 248): `src={thumbUrl || imageUrl}` — these are small thumbnails
- **compact variant** (line 319): `src={thumbUrl || imageUrl}` — card-size
- **default variant** (line 380): `src={thumbUrl || imageUrl}` — card-size

Keep `imageUrl` (full-size) for:
- **showcase variant** (line 102) — this shows a larger preview
- **horizontal variant** (line 276) — keep full since it's a detail-level view

**Step 2: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat: ProductCard uses thumbnails for card-size variants"
```

---

### Task 7: Create Image Optimizer Admin Page

**Files:**
- Create: `app/admin/image-optimizer/page.tsx`
- Create: `app/admin/image-optimizer/ImageOptimizerClient.tsx`

**Step 1: Create the server page**

Create `app/admin/image-optimizer/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import ImageOptimizerClient from './ImageOptimizerClient'

export const dynamic = 'force-dynamic'

interface ImageRecord {
  id: string
  table: string
  imageField: string
  imageValue: string
  label: string
}

export default async function ImageOptimizerPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/admin/login')

  const supabase = await createServerSupabaseClient()

  // Fetch all image URLs from all tables
  const [productsRes, categoriesRes, occasionsRes, heroTilesRes] = await Promise.all([
    supabase.from('products').select('id, name_en, name_mk, image_url'),
    supabase.from('categories').select('id, name_en, name_mk, category_image_path'),
    supabase.from('occasions').select('id, name_en, name_mk, occasion_image_path'),
    supabase.from('hero_tiles').select('id, slot, image_url'),
  ])

  const images: ImageRecord[] = []

  ;(productsRes.data ?? []).forEach((p) => {
    if (p.image_url) {
      images.push({
        id: p.id,
        table: 'products',
        imageField: 'image_url',
        imageValue: p.image_url,
        label: `Product: ${p.name_en || p.name_mk}`,
      })
    }
  })

  ;(categoriesRes.data ?? []).forEach((c) => {
    if (c.category_image_path) {
      images.push({
        id: c.id,
        table: 'categories',
        imageField: 'category_image_path',
        imageValue: c.category_image_path,
        label: `Category: ${c.name_en || c.name_mk}`,
      })
    }
  })

  ;(occasionsRes.data ?? []).forEach((o) => {
    if (o.occasion_image_path) {
      images.push({
        id: o.id,
        table: 'occasions',
        imageField: 'occasion_image_path',
        imageValue: o.occasion_image_path,
        label: `Occasion: ${o.name_en || o.name_mk}`,
      })
    }
  })

  ;(heroTilesRes.data ?? []).forEach((h) => {
    if (h.image_url) {
      images.push({
        id: h.id,
        table: 'hero_tiles',
        imageField: 'image_url',
        imageValue: h.image_url,
        label: `Hero Tile: ${h.slot}`,
      })
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Image Optimizer</h1>
        <p className="text-neutral-600 mt-2">
          Reprocess all images to WebP format with thumbnails.
        </p>
      </div>
      <ImageOptimizerClient images={images} />
    </div>
  )
}
```

**Step 2: Create the client component**

Create `app/admin/image-optimizer/ImageOptimizerClient.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { processImage, sanitizeFilename } from '@/lib/utils'

const BUCKET = 'product-images'

interface ImageRecord {
  id: string
  table: string
  imageField: string
  imageValue: string
  label: string
}

interface ProcessingResult {
  label: string
  status: 'success' | 'error' | 'skipped'
  message: string
}

export default function ImageOptimizerClient({ images }: { images: ImageRecord[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [currentLabel, setCurrentLabel] = useState('')

  const isStoragePath = (value: string) => {
    // Storage paths don't start with http — they're relative paths like "categories/id/file.jpg"
    return !value.startsWith('http')
  }

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
        // Download the image
        const imageUrl = getFullUrl(record.imageValue)
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error(`Failed to download: ${response.status}`)

        const blob = await response.blob()
        const file = new File([blob], 'image.jpg', { type: blob.type })

        // Process to WebP + thumbnail
        const { full, thumbnail } = await processImage(file, 1200)

        // Generate new storage paths
        const timestamp = Date.now()
        const safeName = sanitizeFilename(file.name)

        // Determine folder prefix from existing path or table
        let folder = ''
        if (record.table === 'categories') folder = `categories/${record.id}`
        else if (record.table === 'occasions') folder = `occasions/${record.id}`
        else if (record.table === 'hero_tiles') folder = `hero-tiles/${record.id}`
        else folder = record.id // products

        const fullPath = `${folder}/${timestamp}-${safeName}`
        const thumbPath = `${folder}/${timestamp}-${safeName.replace('.webp', '_thumb.webp')}`

        // Upload both
        const [fullResult, thumbResult] = await Promise.all([
          supabase.storage.from(BUCKET).upload(fullPath, full, { cacheControl: '3600', upsert: true }),
          supabase.storage.from(BUCKET).upload(thumbPath, thumbnail, { cacheControl: '3600', upsert: true }),
        ])

        if (fullResult.error) throw new Error(fullResult.error.message)
        if (thumbResult.error) throw new Error(thumbResult.error.message)

        // Determine new value to store in DB
        let newValue: string
        if (isStoragePath(record.imageValue)) {
          // Categories & occasions store relative paths
          newValue = fullPath
        } else {
          // Products & hero_tiles store full public URLs
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(fullPath)
          newValue = data.publicUrl
        }

        // Update the DB record
        const { error: updateError } = await supabase
          .from(record.table)
          .update({ [record.imageField]: newValue } as never)
          .eq('id', record.id)

        if (updateError) throw new Error(updateError.message)

        setResults((prev) => [...prev, { label: record.label, status: 'success', message: 'Converted to WebP + thumbnail' }])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
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
            <p className="text-sm text-neutral-500">Total images across all tables</p>
          </div>
          <button
            onClick={reprocessAll}
            disabled={processing || images.length === 0}
            className="btn btn-primary"
          >
            {processing ? 'Processing...' : 'Reprocess All Images'}
          </button>
        </div>

        {/* Progress bar */}
        {processing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Processing: {currentLabel}</span>
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

        {/* Results summary */}
        {results.length > 0 && !processing && (
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-emerald-600 font-medium">{successCount} succeeded</span>
            {errorCount > 0 && <span className="text-red-600 font-medium">{errorCount} failed</span>}
          </div>
        )}
      </div>

      {/* Results list */}
      {results.length > 0 && (
        <div className="rounded-2xl bg-white shadow-card border border-neutral-100 overflow-hidden">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-800">Results</h2>
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
          <h2 className="text-lg font-semibold text-neutral-800">Image Inventory</h2>
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
                  {isWebp ? 'WebP' : 'Not WebP'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Verify no TypeScript errors**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add app/admin/image-optimizer/
git commit -m "feat: add Image Optimizer admin page for bulk WebP reprocessing"
```

---

### Task 8: Verify Everything Works

**Step 1: Run the dev server**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npm run dev`

**Step 2: Manual verification checklist**

- Navigate to `/admin/image-optimizer` — page loads with image inventory
- Navigate to `/admin/products` — upload a new image, confirm `.webp` files appear in Supabase Storage (full + `_thumb`)
- Check that product cards on the public site load correctly (they'll fall back to full URL if no thumbnail exists)

**Step 3: Run type check and lint**

Run: `cd /Users/filipmicevski/Desktop/Work/Projects/Gerbera/website/Gerbera && npx tsc --noEmit && npm run lint`
