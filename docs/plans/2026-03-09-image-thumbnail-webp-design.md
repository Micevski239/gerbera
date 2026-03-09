# Image Thumbnail & WebP Conversion System

## Overview

All image processing is client-side using Canvas API. Every uploaded image is converted to WebP and a thumbnail is generated alongside it.

## Architecture

### On Upload

`compressImage()` is refactored to `processImage()` returning `{ full: File, thumbnail: File }`, both WebP format.

Two files are uploaded to Supabase Storage per image:
- `{path}.webp` — full size, max 1200px wide
- `{path}_thumb.webp` — thumbnail, max 400px wide

### Thumbnail URL Derivation

No database schema changes. A `getThumbnailUrl(url)` utility derives the thumbnail URL from the full URL by replacing `.webp` with `_thumb.webp`.

### Image Optimizer Admin Page (`/admin/image-optimizer`)

- Lists all images across products, categories, occasions, and hero tiles
- "Reprocess All Images" button downloads each image, converts to WebP + thumbnail, re-uploads, and updates DB `image_url` references
- Progress bar and per-image status (success/fail)
- Old files left in place (no deletion)

## Components Modified

- `lib/utils.ts` — `compressImage()` refactored to `processImage()`, `sanitizeFilename()` updated to `.webp` extension, new `getThumbnailUrl()` helper
- `app/admin/products/ProductsClient.tsx` — upload both full + thumbnail
- `app/admin/categories/CategoriesClient.tsx` — upload both full + thumbnail
- `app/admin/occasions/OccasionsClient.tsx` — upload both full + thumbnail
- `app/admin/hero-tiles/HeroTilesClient.tsx` — upload both full + thumbnail
- `components/ProductCard.tsx` — use `getThumbnailUrl()` for card images
- Category/occasion cards on public pages — use thumbnails

## Components Created

- `app/admin/image-optimizer/page.tsx` — server page
- `app/admin/image-optimizer/ImageOptimizerClient.tsx` — client component with reprocess UI

## Sizes

- Full: max 1200px width, WebP 80% quality
- Thumbnail: max 400px width, WebP 80% quality

## No Changes Required

- No database schema changes
- No new dependencies
- No server-side processing
- Supabase Storage bucket already accepts WebP
