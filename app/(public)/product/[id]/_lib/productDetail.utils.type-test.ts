import type { Product } from '@/lib/supabase/types'
import {
  formatDenarPrice,
  getProductDisplayPrices,
  getProductWhatsAppMessages,
  getWhatsAppLink,
} from './productDetail.utils'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false

type Assert<T extends true> = T

type _formatPriceReturn = Assert<Equal<ReturnType<typeof formatDenarPrice>, string | null>>
type _displayPriceReturn = Assert<Equal<
  ReturnType<typeof getProductDisplayPrices>,
  { currentPrice: string | null; originalPrice: string | null; displayPrice: string | null }
>>
type _messageReturn = Assert<Equal<
  ReturnType<typeof getProductWhatsAppMessages>,
  { orderMessage: string; askMessage: string }
>>
type _linkReturn = Assert<Equal<ReturnType<typeof getWhatsAppLink>, string>>

const product = {} as Product
const displayPrices = getProductDisplayPrices(product)
const messages = getProductWhatsAppMessages('mk', 'Test', displayPrices.currentPrice)
const link = getWhatsAppLink('38970000000', messages.orderMessage)

void link
