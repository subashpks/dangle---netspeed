import React, { useState } from 'react';
import AppleCategoryRibbon from '../components/AppleCategoryRibbon';
import MinimalCharmGrid from '../components/MinimalCharmGrid';
import { categories, realCharmsList } from '../data/realCharmsCatalog';
import { Search, Sparkles } from 'lucide-react';

export default function CollectionsPage({ activeCharm, onSelectCharm }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharms = realCharmsList.filter((charm) => {
    const matchesCategory = activeCategory === 'all' || charm.category === activeCategory;
    const matchesSearch =
      charm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charm.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charm.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="apple-page-wrapper collections-view">
      {/* Apple Hero Header */}
      <section className="apple-hero-header">
        <span className="apple-category-eyebrow">Store · Collections</span>
        <h1 className="apple-hero-title">
          The best way to personalize your screen.
        </h1>
        <p className="apple-hero-sub">
          Explore 38+ handcrafted dangles designed with sacred geometries, cultural heritage, and smooth physics.
        </p>

        {/* Apple Spotlight Search Input */}
        <div className="apple-spotlight-search">
          <Search size={16} className="apple-search-icon" />
          <input
            type="text"
            placeholder="Search Balaji, Vel, Shiva, Cross, Crescent, Nimbu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="apple-search-input"
          />
          {searchQuery && (
            <button
              className="apple-search-clear"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Apple Circular Category Ribbon */}
      <section className="apple-ribbon-section">
        <AppleCategoryRibbon
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </section>

      {/* Grid Meta Header */}
      <div className="apple-catalog-header-row">
        <div className="apple-catalog-title-group">
          <h2 className="apple-catalog-heading">
            {activeCategory === 'all'
              ? 'All Available Dangles'
              : categories.find((c) => c.id === activeCategory)?.label || 'Collection'}
          </h2>
          <span className="apple-catalog-counter">({filteredCharms.length} items)</span>
        </div>
      </div>

      {/* Apple Studio Products Grid */}
      <section className="apple-catalog-content">
        <MinimalCharmGrid
          charms={filteredCharms}
          activeCharm={activeCharm}
          onSelectCharm={onSelectCharm}
        />
      </section>
    </div>
  );
}
