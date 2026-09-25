import React from 'react';
import { Volume2, Sparkles, Plus, Eye, Monitor } from 'lucide-react';

export default function DangleCard({
  dangle,
  lang,
  t,
  isActive,
  onSelectForSimulation,
  onPlayChime
}) {
  return (
    <div className={`dangle-product-card ${isActive ? 'is-active-card' : ''}`}>
      {/* Top Auspicious Pill Tag */}
      <div className="card-top-tag-row">
        <span className="card-ornate-pill">{dangle.tag[lang]}</span>
        <button
          className="card-audio-btn"
          onClick={(e) => {
            e.stopPropagation();
            onPlayChime(dangle.chimeFreq);
          }}
          title={t.soundPreview}
        >
          <Volume2 size={15} />
        </button>
      </div>

      {/* Dangle Visual Preview Circle */}
      <div
        className="card-charm-preview-area"
        onClick={() => onSelectForSimulation(dangle)}
      >
        <div className="charm-halo" style={{ backgroundColor: `${dangle.color}25` }}></div>
        <div className="charm-display-mini" style={{ borderColor: dangle.color }}>
          <span className="mini-icon">{dangle.iconEmoji || '🪔'}</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="card-dangle-name">{dangle.name[lang]}</h3>
      <p className="card-dangle-desc">{dangle.description[lang]}</p>

      {/* Price & Action Row */}
      <div className="card-footer-row">
        <div className="card-price-block">
          <span className="price-val">{dangle.price}</span>
          <span className="price-sub">{t.pricePerSet}</span>
        </div>

        <div className="card-btn-group">
          <button
            className={`btn-preview-dangle ${isActive ? 'active' : ''}`}
            onClick={() => onSelectForSimulation(dangle)}
            title={t.previewDangle}
          >
            <Monitor size={14} />
            <span>{t.previewDangle}</span>
          </button>

          <button
            className="btn-add-dangle"
            onClick={() => {
              onPlayChime(dangle.chimeFreq);
              alert(`🪔 Added ${dangle.name[lang]} to your Jinglee App collection!`);
            }}
          >
            <Plus size={14} />
            <span>{t.addToApp}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
