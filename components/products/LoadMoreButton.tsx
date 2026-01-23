'use client'

import { useLanguage } from '@/context/LanguageContext'

interface LoadMoreButtonProps {
  onClick: () => void
  loading: boolean
  hasMore: boolean
}

export default function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
  const { t } = useLanguage()

  if (!hasMore) return null

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="btn btn-outline"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('common.loading')}</span>
          </>
        ) : (
          <>
            <span>{t('common.loadMore')}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
