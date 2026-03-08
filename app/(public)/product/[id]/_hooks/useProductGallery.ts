import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, TouchEvent } from 'react'

interface UseProductGalleryOptions {
  imageCount: number
}

export function useProductGallery({ imageCount }: UseProductGalleryOptions) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => {
    if (selectedImageIndex <= imageCount - 1) return
    setSelectedImageIndex(0)
    setImageError(false)
  }, [imageCount, selectedImageIndex])

  const selectImage = useCallback((index: number) => {
    setSelectedImageIndex(index)
    setImageError(false)
  }, [])

  const moveToNextImage = useCallback(() => {
    if (imageCount <= 1) return
    setSelectedImageIndex((prev) => (prev < imageCount - 1 ? prev + 1 : 0))
    setImageError(false)
  }, [imageCount])

  const moveToPrevImage = useCallback(() => {
    if (imageCount <= 1) return
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : imageCount - 1))
    setImageError(false)
  }, [imageCount])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') {
      moveToPrevImage()
    } else if (e.key === 'ArrowRight') {
      moveToNextImage()
    }
  }, [moveToNextImage, moveToPrevImage])

  const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLElement>) => {
    if (imageCount <= 1) return
    const swipeDistance = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(swipeDistance) <= 50) return
    if (swipeDistance > 0) {
      moveToNextImage()
    } else {
      moveToPrevImage()
    }
  }, [imageCount, moveToNextImage, moveToPrevImage])

  return {
    selectedImageIndex,
    imageError,
    setImageError,
    selectImage,
    handleKeyDown,
    handleTouchStart,
    handleTouchEnd,
  }
}
