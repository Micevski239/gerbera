import Link from 'next/link'
import Image from 'next/image'
import type { Language } from '@/lib/supabase/types'
import type { SectionWithProducts } from '@/types/sections'

interface SectionListProps {
  sections: SectionWithProducts[]
  language: Language
}

const currencyFormatter = (locale: Language) =>
  new Intl.NumberFormat(locale === 'mk' ? 'mk-MK' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  })

export default function SectionList({ sections, language }: SectionListProps) {
  if (sections.length === 0) return null

  const formatPrice = currencyFormatter(language)

  return (
    <div className="space-y-16">
      {sections.map((section) => (
        <section key={section.id} className="rounded-3xl border border-neutral-100 bg-white/80 p-6 shadow-xl shadow-primary-50/30">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400">{section.category?.name_en || 'Product collection'}</p>
              <h2 className="font-heading text-3xl text-neutral-900">
                {language === 'mk' ? section.title_mk : section.title_en}
              </h2>
            </div>
            {section.category?.slug && (
              <Link href={`/category/${section.category.slug}`} className="btn btn-outline">
                View all
              </Link>
            )}
          </header>

          {section.products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-neutral-500">
              No published products for this category yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {section.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`relative aspect-square w-full overflow-hidden ${section.shape === 'circle' ? 'rounded-3xl' : 'rounded-2xl'}`}>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={language === 'mk' ? product.name_mk || product.name : product.name_en || product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 35vw, 280px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1 text-center">
                    <p className="text-sm font-medium text-neutral-800">
                      {language === 'mk'
                        ? product.name_mk || product.name
                        : product.name_en || product.name}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">
                      {section.category?.name_en || ''}
                    </p>
                    {(product.price || product.price_text) && (
                      <p className="text-base font-semibold text-neutral-900">
                        {product.price ? formatPrice.format(product.price) : product.price_text}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
