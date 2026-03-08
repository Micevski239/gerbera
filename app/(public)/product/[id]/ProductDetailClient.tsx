'use client'

import { useMemo } from 'react'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import ScrollReveal from '@/components/ScrollReveal'
import { SOCIAL } from '@/lib/social'
import type { Product, ProductImage, Category } from '@/lib/supabase/types'
import ProductDetailBreadcrumb from './_components/ProductDetailBreadcrumb'
import ProductGallery from './_components/ProductGallery'
import ProductInfoHeader from './_components/ProductInfoHeader'
import ProductTrustBadges from './_components/ProductTrustBadges'
import ProductOrderChannels from './_components/ProductOrderChannels'
import ProductRelatedSection from './_components/ProductRelatedSection'
import { useProductGallery } from './_hooks/useProductGallery'
import { getProductDisplayPrices } from './_lib/productDetail.utils'
import type { ProductDetailViewModel } from './_lib/productDetail.types'

interface ProductDetailClientProps {
  product: Product
  images: ProductImage[]
  category: Category | null
  relatedProducts: Product[]
}

export default function ProductDetailClient({
  product,
  images,
  category,
  relatedProducts,
}: ProductDetailClientProps) {
  const { language, t } = useLanguage()

  const viewModel = useMemo<ProductDetailViewModel>(() => {
    const name = getLocalizedField(product, 'name', language)
    const description = getLocalizedField(product, 'description', language)
    const categoryName = category ? getLocalizedField(category, 'name', language) : ''
    const { currentPrice, originalPrice, displayPrice } = getProductDisplayPrices(product)

    return {
      name,
      description,
      categoryName,
      currentPrice,
      originalPrice,
      displayPrice,
    }
  }, [category, language, product])

  const {
    selectedImageIndex,
    imageError,
    setImageError,
    selectImage,
    handleKeyDown,
    handleTouchStart,
    handleTouchEnd,
  } = useProductGallery({ imageCount: images.length })

  return (
    <div className="min-h-screen bg-canvas-100 text-ink-base">
      <main className="bg-canvas-100">
        <div className="container-custom py-8">
          <ProductDetailBreadcrumb
            homeLabel={t('nav.home')}
            productsLabel={t('nav.products')}
            productName={viewModel.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductGallery
              product={product}
              images={images}
              language={language}
              productName={viewModel.name}
              selectedImageIndex={selectedImageIndex}
              imageError={imageError}
              onMainImageError={() => setImageError(true)}
              onSelectImage={selectImage}
              onKeyDown={handleKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />

            <div className="flex flex-col">
              <ProductInfoHeader
                categoryName={viewModel.categoryName}
                productName={viewModel.name}
                description={viewModel.description}
                displayPrice={viewModel.displayPrice}
                currentPrice={viewModel.currentPrice}
                originalPrice={viewModel.originalPrice}
              />

              <div className="lg:mt-auto">
                <ProductTrustBadges
                  language={language}
                  handmadeLabel={t('product.handmade')}
                />

                <div className="h-px bg-border-soft mb-6" />

                <ProductOrderChannels
                  language={language}
                  whatsappUrl={SOCIAL.whatsapp}
                  instagramUrl={SOCIAL.instagram}
                  facebookUrl={SOCIAL.facebook}
                />
              </div>
            </div>
          </div>

          <ScrollReveal>
            <ProductRelatedSection
              relatedProducts={relatedProducts}
              language={language}
              title={t('product.moreFromCategory')}
            />
          </ScrollReveal>
        </div>
      </main>
    </div>
  )
}
