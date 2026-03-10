import type { Product } from '@/lib/supabase/types'

export function formatDenarPrice(price: number | null): string | null {
  if (price === null || price === undefined) return null
  return `${price.toFixed(0)} ден`
}

export function getProductDisplayPrices(product: Product) {
  const discountedPrice = product.is_on_sale && product.sale_price ? product.sale_price : product.price
  const currentPrice = formatDenarPrice(discountedPrice)
  const originalPrice = product.is_on_sale && product.sale_price ? formatDenarPrice(product.price) : null
  const displayPrice = currentPrice || product.price_text || null

  return {
    currentPrice,
    originalPrice,
    displayPrice,
  }
}

export function getProductWhatsAppMessages(name: string, currentPrice: string | null) {
  const orderMessage = `Здраво! Ме интересира ${name}${currentPrice ? ` (${currentPrice})` : ''}`
  const askMessage = `Здраво! Имам прашање за ${name}`

  return {
    orderMessage,
    askMessage,
  }
}

export function getWhatsAppLink(whatsappNumber: string, message: string) {
  if (!whatsappNumber) return '#'
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
