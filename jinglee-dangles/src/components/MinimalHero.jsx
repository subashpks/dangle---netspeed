import React from 'react';
import { ArrowDown, Sparkles, Monitor, Wind, ShieldCheck } from 'lucide-react';

export default function MinimalHero({ activeCharm, onScrollToCatalog }) {
  return (
    <section className="minimal-hero-section">
      <div className="hero-content">
        <div className="hero-pill-tag">
          <Sparkles size={14} className="tag-sparkle" />
          <span>Matter.js Physics · Menubar Companion</span>
        </div>

        <h1 className="hero-title">
          Desktop Dangles for your Screen.
        </h1>

        <p className="hero-description">
          Delightful, physics-driven cultural and spiritual charms that hang gracefully 
          from your macOS menubar or Windows screen edge with zero-gravity ribbon flutters.
        </p>

        <div className="hero-action-row">
          <button className="btn-hero-primary" onClick={onScrollToCatalog}>
            Explore All 9 Collections
            <ArrowDown size={16} />
          </button>
          <a href="#downloads" className="btn-hero-secondary">
            Get for Mac & Windows
          </a>
        </div>

        {/* Feature Pills */}
        <div className="hero-feature-pills">
          <div className="feature-pill">
            <Wind size={14} />
            <span>Organic Wind Flutter</span>
          </div>
          <div className="feature-pill">
            <Monitor size={14} />
            <span>Retina High-Res PNGs</span>
          </div>
          <div className="feature-pill">
            <ShieldCheck size={14} />
            <span>38+ Authentic Charms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
