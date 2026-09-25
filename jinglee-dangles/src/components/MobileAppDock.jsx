import React from 'react';
import { Download, Sparkles, Smartphone, Monitor } from 'lucide-react';

export default function MobileAppDock({ t, onScrollToCatalog }) {
  return (
    <div className="mobile-app-dock">
      <div className="dock-glass-bar">
        <div className="dock-info">
          <div className="dock-brand">
            <span className="dock-crest">🪔</span>
            <strong>Jinglee App</strong>
          </div>
          <span className="dock-subtitle">Desktop & Mobile Dangles</span>
        </div>

        <div className="dock-actions">
          <button className="dock-btn-primary" onClick={onScrollToCatalog}>
            <Sparkles size={16} />
            <span>{t.exploreBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
