'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { GridImage } from '@/lib/supabase/types'

interface ImageGridProps {
  images: GridImage[]
  variant?: 'masonry' | 'uniform'
}

export default function ImageGrid({ images, variant = 'uniform' }: ImageGridProps) {
  const { language } = useLanguage()

  if (!images.length) return null

  if (variant === 'masonry') {
    return (
      <section className="section bg-neutral-50">
        <div className="container-custom">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((image, index) => {
              const imageUrl = getImageUrl(image.image_path)
              const altText = getLocalizedField(image, 'alt_text', language) || `Gallery image ${index + 1}`

              const Wrapper = image.link ? Link : 'div'
              const wrapperProps = image.link ? { href: image.link } : {}

              return (
                <Wrapper
                  key={image.id}
                  {...wrapperProps as any}
                  className="block break-inside-avoid group"
                >
                  <div className="relative overflow-hidden rounded-2xl hover-grow">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={altText}
                        width={400}
                        height={index % 3 === 0 ? 500 : index % 3 === 1 ? 350 : 400}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {image.link && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-4 py-2 rounded-xl text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-all">
                          View
                        </span>
                      </div>
                    )}
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Uniform grid
  return (
    <section className="section bg-neutral-50">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const imageUrl = getImageUrl(image.image_path)
            const altText = getLocalizedField(image, 'alt_text', language) || `Gallery image ${index + 1}`

            const Wrapper = image.link ? Link : 'div'
            const wrapperProps = image.link ? { href: image.link } : {}

            return (
              <Wrapper
                key={image.id}
                {...wrapperProps as any}
                className="block group"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 hover-lift shadow-soft hover:shadow-card-hover transition-all duration-300">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={altText}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}
                  {image.link && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
