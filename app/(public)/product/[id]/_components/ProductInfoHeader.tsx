'use client'

interface ProductInfoHeaderProps {
  categoryName: string
  productName: string
  description: string
  displayPrice: string | null
  currentPrice: string | null
  originalPrice: string | null
}

export default function ProductInfoHeader({
  categoryName,
  productName,
  description,
  displayPrice,
  currentPrice,
  originalPrice,
}: ProductInfoHeaderProps) {
  return (
    <div>
      {categoryName && (
        <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-secondary-50 text-secondary-700 rounded-full mb-3">
          {categoryName}
        </span>
      )}

      <h1 className="text-3xl md:text-4xl font-heading font-semibold text-ink-strong mb-4">
        {productName}
      </h1>

      {displayPrice && (
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-bold text-primary-500">
            {currentPrice || displayPrice}
          </span>
          {originalPrice && (
            <span className="text-lg text-ink-muted line-through">
              {originalPrice}
            </span>
          )}
        </div>
      )}

      {description && (
        <div className="mb-6">
          <p className="text-base text-ink-base whitespace-pre-wrap leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  )
}
