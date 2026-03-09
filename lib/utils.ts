// Utility functions

// Generate URL-friendly slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Allowed image MIME types for uploads
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Validate file is an allowed image type
export function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type)
}

// Sanitize filename for storage paths (always outputs .webp extension)
export function sanitizeFilename(filename: string): string {
  const safeName = filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
  return `${safeName}.webp`
}

// Convert a canvas to a WebP File
function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  filename: string,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob returned null'))
          return
        }
        resolve(
          new File([blob], filename, {
            type: 'image/webp',
            lastModified: Date.now(),
          })
        )
      },
      'image/webp',
      quality
    )
  })
}

// Load a File into an HTMLImageElement
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Draw an image onto a canvas, scaling down to maxWidth while preserving aspect ratio
function drawScaled(
  img: HTMLImageElement,
  maxWidth: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  let width = img.width
  let height = img.height

  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

// Process an image into a full-size WebP and a thumbnail WebP
export async function processImage(
  file: File,
  maxWidth = 1200,
  thumbMaxWidth = 400
): Promise<{ full: File; thumbnail: File }> {
  const img = await loadImage(file)
  const baseName = sanitizeFilename(file.name).replace(/\.webp$/, '')

  const fullCanvas = drawScaled(img, maxWidth)
  const thumbCanvas = drawScaled(img, thumbMaxWidth)

  const [full, thumbnail] = await Promise.all([
    canvasToWebpFile(fullCanvas, `${baseName}.webp`),
    canvasToWebpFile(thumbCanvas, `${baseName}_thumb.webp`),
  ])

  return { full, thumbnail }
}

// Backward-compatible wrapper: compress and convert to WebP (returns full-size only)
export async function compressImage(
  file: File,
  maxWidth = 1200
): Promise<File> {
  const { full } = await processImage(file, maxWidth)
  return full
}

// Derive thumbnail URL from a full-size image URL
// e.g. ".../image.webp" → ".../image_thumb.webp"
export function getThumbnailUrl(url: string): string {
  return url.replace(/\.webp$/, '_thumb.webp')
}

// Class name helper (simple alternative to clsx)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
