'use client'

import { WhatsAppIcon } from './ProductDetailIcons'

interface ProductWhatsAppActionsProps {
  orderLink: string
  askLink: string
  orderLabel: string
  askLabel: string
}

export default function ProductWhatsAppActions({
  orderLink,
  askLink,
  orderLabel,
  askLabel,
}: ProductWhatsAppActionsProps) {
  return (
    <div className="space-y-3 mb-6">
      <a
        href={orderLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp w-full justify-center text-base py-3.5 rounded-full"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {orderLabel}
      </a>

      <a
        href={askLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline w-full justify-center text-base py-3.5 rounded-full"
      >
        {askLabel}
      </a>
    </div>
  )
}
