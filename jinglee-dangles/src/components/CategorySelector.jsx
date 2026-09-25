import React from 'react';

export default function CategorySelector({ categories, activeCategory, onSelectCategory, t }) {
  return (
    <div className="category-scroll-wrapper">
      <div className="category-pill-container">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {t[cat.labelKey]}
          </button>
        ))}
      </div>
    </div>
  );
}
