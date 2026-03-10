'use client'

import type { ReactElement } from 'react'
import { FacebookIcon, InstagramIcon } from './ProductDetailIcons'

interface ProductSocialLinksProps {
  instagramUrl?: string
  facebookUrl?: string
}

export default function ProductSocialLinks({
  instagramUrl,
  facebookUrl,
}: ProductSocialLinksProps) {
  const links: Array<{ key: string; href?: string; label: string; icon: ReactElement }> = [
    {
      key: 'instagram',
      href: instagramUrl,
      label: 'Instagram',
      icon: <InstagramIcon className="w-3.5 h-3.5" />,
    },
    {
      key: 'facebook',
      href: facebookUrl,
      label: 'Facebook',
      icon: <FacebookIcon className="w-3.5 h-3.5" />,
    },
  ]
  const visibleLinks = links.filter((link) => Boolean(link.href))

  if (visibleLinks.length === 0) return null

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs text-ink-muted">Следете не:</span>
      {visibleLinks.map((link) => (
        <a
          key={link.key}
          href={link.href!}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-canvas-200 hover:bg-ink-strong hover:text-white rounded-full flex items-center justify-center text-ink-muted transition-colors"
          aria-label={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  )
}
