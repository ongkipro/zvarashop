import React, { useState, useRef, useEffect } from 'react';

interface ProductImageSliderProps {
  images: string[];
  productName: string;
  badgeText?: string;
  discountPercentage?: number;
}

export default function ProductImageSlider({
  images,
  productName,
  badgeText,
  discountPercentage = 0,
}: ProductImageSliderProps) {
  const gallery = images.filter((image) => image.trim());
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  const activeImage = gallery[activeIndex] || gallery[0];

  useEffect(() => {
    if (activeIndex === 0) return;
    const el = thumbnailRefs.current[activeIndex];
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [activeIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Minimum swipe threshold of 35px
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };
  if (!activeImage) return null;

  return (
    <div className="relative flex w-full select-none flex-col gap-2">
      {/* Main product hero image (Top) - Touch Swipe Left/Right Support (No Pop-up) */}
      <div
        className="group relative flex w-full aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={activeImage}
          alt={`${productName} foto ${activeIndex + 1}`}
          width={480}
          height={480}
          className="h-full w-full object-cover transition-transform duration-500"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {/* Badge Overlay Top */}
        <div className="absolute left-0 top-0 z-10 flex flex-col items-start gap-1 pointer-events-none">
          {badgeText && (
            <span className="rounded-br-md bg-[#EE4D2D]/90 backdrop-blur-xs px-2 py-1 text-[11px] font-bold text-white shadow-sm">
              {badgeText}
            </span>
          )}
        </div>
        {discountPercentage > 0 && (
          <div className="absolute right-0 top-0 z-10 flex flex-col items-center bg-[#FEEA2E]/90 px-2 py-1.5 backdrop-blur-xs rounded-bl-md shadow-sm pointer-events-none">
            <span className="text-[14px] font-black leading-none text-[#EE4D2D]">{discountPercentage}%</span>
            <span className="mt-0.5 rounded-sm bg-[#EE4D2D] px-1 py-[2px] text-[10px] font-bold leading-none text-white uppercase tracking-wider">OFF</span>
          </div>
        )}

        {/* Counter Badge Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none rounded-full bg-slate-900/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {activeIndex + 1}/{gallery.length}
        </div>

        {/* Navigation Arrows */}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto Sebelumnya"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-sm transition hover:bg-white focus-visible:outline-none active:scale-95 z-20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto Berikutnya"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-sm transition hover:bg-white focus-visible:outline-none active:scale-95 z-20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row (Bottom) */}
      {gallery.length > 1 && (
        <div className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto pb-1">
          {gallery.map((imgUrl, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                ref={(el) => { thumbnailRefs.current[idx] = el; }}
                type="button"
                aria-label={`Lihat foto ${idx + 1} dari ${gallery.length}`}
                aria-pressed={isActive}
                onClick={() => setActiveIndex(idx)}
                className={`group relative aspect-square w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 focus-visible:outline-none ${
                  isActive
                    ? 'border-[#EE4D2D] opacity-100 ring-2 ring-[#EE4D2D] ring-offset-1'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#EE4D2D]/50'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  loading={idx < 5 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
