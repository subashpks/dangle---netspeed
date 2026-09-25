import React from 'react';
import { ChevronUp, Smartphone } from 'lucide-react';

export default function ZenFocusStageBar({ activeCharm, onExitZen, onNavigate }) {
  return (
    <div className="zen-focus-stage-bar" role="region" aria-label="Zen Focus Controls">
      <div className="zen-pill-island">
        {/* Swipe / Click restore hint */}
        <button
          type="button"
          className="zen-restore-trigger"
          onClick={onExitZen}
          aria-label="Swipe up or click to explore catalog"
        >
          <div className="zen-swipe-icon-wrapper">
            <ChevronUp size={16} className="zen-swipe-chevron" />
          </div>
          <div className="zen-restore-text">
            <strong>{activeCharm?.name || 'Dangle Stage'}</strong>
            <span>Swipe up or tap to explore catalog</span>
          </div>
        </button>

        {/* Quick action buttons */}
        <div className="zen-quick-actions">
          <button
            type="button"
            className="zen-action-pill"
            onClick={() => {
              onExitZen();
              onNavigate('downloads');
            }}
          >
            <Smartphone size={14} />
            <span>Pair App</span>
          </button>
        </div>
      </div>
    </div>
  );
}
