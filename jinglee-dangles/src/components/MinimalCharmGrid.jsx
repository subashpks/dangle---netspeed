import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function MinimalCharmGrid({
  charms,
  activeCharm,
  onSelectCharm
}) {
  return (
    <div className="apple-rectangular-grid">
      {charms.map((charm) => {
        const isCurrentlyActive = activeCharm && activeCharm.id === charm.id;

        return (
          <div
            key={charm.id}
            className={`apple-rectangular-card ${isCurrentlyActive ? 'is-active-card' : ''}`}
            onClick={() => {
              onSelectCharm(charm);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
          >
            {/* Left Column: Artwork Stage */}
            <div className="rect-card-stage">
              <div
                className="rect-ambient-glow"
                style={{ backgroundColor: `${charm.color || '#D4AF37'}18` }}
              />
              <img
                src={charm.image}
                alt={charm.name}
                className="rect-charm-image"
                loading="lazy"
              />
              <div className="rect-pedestal-shadow" />
            </div>

            {/* Right Column: Information & Actions */}
            <div className="rect-card-content">
              {/* Top Meta Row */}
              <div className="rect-meta-row">
                <span className="rect-tag-pill">{charm.tag}</span>
                {isCurrentlyActive && (
                  <span className="rect-live-badge">
                    <span className="live-pulse-dot" />
                    Hanging Live
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="rect-text-body">
                <h3 className="rect-product-title">{charm.name}</h3>
                <p className="rect-product-desc">{charm.description}</p>
              </div>

              {/* Footer Action */}
              <div className="rect-action-row">
                <button
                  type="button"
                  className={`rect-hang-btn ${isCurrentlyActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCharm(charm);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {isCurrentlyActive ? (
                    <>
                      <Check size={14} className="btn-icon" />
                      <span>Active on Screen</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="btn-icon" />
                      <span>Hang This Dangle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
