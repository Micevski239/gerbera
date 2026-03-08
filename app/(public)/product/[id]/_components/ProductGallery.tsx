'use client'

import Image from 'next/image'
import type { KeyboardEventHandler, TouchEventHandler } from 'react'
import { getImageUrl } from '@/lib/supabase/client'
import type { Product, ProductImage } from '@/lib/supabase/types'
import ProductStatusBadges from './ProductStatusBadges'
import { ImagePlaceholderIcon } from './ProductDetailIcons'

interface ProductGalleryProps {
  product: Product
  images: ProductImage[]
  language: 'mk' | 'en'
  productName: string
  selectedImageIndex: number
  imageError: boolean
  onMainImageError: () => void
  onSelectImage: (index: number) => void
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onTouchStart: TouchEventHandler<HTMLElement>
  onTouchEnd: TouchEventHandler<HTMLElement>
}

export default function ProductGallery({
  product,
  images,
  language,
  productName,
  selectedImageIndex,
  imageError,
  onMainImageError,
  onSelectImage,
  onKeyDown,
  onTouchStart,
  onTouchEnd,
}: ProductGalleryProps) {
  const selectedImage = images[selectedImageIndex]
  const selectedImageUrl = selectedImage
    ? getImageUrl(selectedImage.storage_path)
    : (product.image_url || null)

  return (
    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div
        className="group/zoom relative aspect-square overflow-hidden bg-surface-base border border-border-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-zoom-in"
        tabIndex={0}
        role="region"
        aria-label={images.length > 1
          ? `${language === 'mk' ? 'Галерија' : 'Image gallery'}, ${selectedImageIndex + 1} ${language === 'mk' ? 'од' : 'of'} ${images.length}`
          : (language === 'mk' ? 'Слика од производ' : 'Product image')}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {selectedImageUrl && !imageError ? (
          <Image
            src={selectedImageUrl}
            alt={selectedImage?.alt_text || productName}
            fill
            className="object-cover img-warm transition-transform duration-500 ease-out group-hover/zoom:scale-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            onError={onMainImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-300">
            <ImagePlaceholderIcon className="w-20 h-20 mb-2" />
            <span className="text-sm text-neutral-400">{language === 'mk' ? 'Нема слика' : 'No image'}</span>
          </div>
        )}

        <ProductStatusBadges product={product} language={language} />

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 lg:hidden" aria-label={language === 'mk' ? 'Слики' : 'Images'}>
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectImage(i)
                }}
                className={`rounded-full transition-all ${
                  i === selectedImageIndex
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/60'
                }`}
                aria-label={`${language === 'mk' ? 'Слика' : 'Image'} ${i + 1}`}
                aria-current={i === selectedImageIndex}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" aria-label={language === 'mk' ? 'Преглед на слики' : 'Image previews'}>
          {images.map((image, index) => {
            const thumbUrl = getImageUrl(image.storage_path)
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelectImage(index)}
                aria-label={`${language === 'mk' ? 'Прикажи слика' : 'View image'} ${index + 1} ${language === 'mk' ? 'од' : 'of'} ${images.length}`}
                aria-pressed={index === selectedImageIndex}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                  index === selectedImageIndex
                    ? 'ring-2 ring-primary-500 ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {thumbUrl && (
                  <Image
                    src={thumbUrl}
                    alt={image.alt_text || `${productName} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
