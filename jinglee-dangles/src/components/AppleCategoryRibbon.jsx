import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppleCategoryRibbon({
  categories,
  activeCategory,
  onSelectCategory
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="apple-category-ribbon-wrapper">
      {/* Left Scroll Chevron */}
      <button
        type="button"
        className="ribbon-arrow-btn left"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Scrollable Container */}
      <div className="apple-category-ribbon-scroll" ref={scrollRef}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`apple-category-capsule ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
              type="button"
            >
              <div className="capsule-icon-box">
                <img
                  src={cat.thumb}
                  alt={cat.label}
                  className="capsule-thumb-img"
                  loading="lazy"
                />
              </div>

              <div className="capsule-meta">
                <span className="capsule-title">{cat.label}</span>
                <span className="capsule-badge">{cat.count} dangles</span>
              </div>

              {isActive && <div className="capsule-active-indicator" />}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Chevron */}
      <button
        type="button"
        className="ribbon-arrow-btn right"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
