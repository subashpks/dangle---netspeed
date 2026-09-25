import React from 'react';
import { Music, Music2, Globe, Sparkles } from 'lucide-react';

export default function TopNav({ lang, setLang, isMusicPlaying, toggleMusic, t }) {
  return (
    <nav className="top-nav-bar">
      {/* Brand & Auspicious Seal */}
      <div className="nav-brand-seal">
        <div className="brand-crest">
          <span className="crest-diya">🪔</span>
        </div>
        <div className="brand-text-block">
          <span className="brand-primary-name">Jinglee</span>
          <span className="brand-tamil-name">ஜிங்கிலி</span>
        </div>
      </div>

      {/* Action Controls matching Image 2 */}
      <div className="nav-right-controls">
        {/* Background Sacred Music Toggle (இசை) */}
        <button
          className={`nav-pill-btn music-btn ${isMusicPlaying ? 'playing' : ''}`}
          onClick={toggleMusic}
          title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isMusicPlaying ? (
            <Music2 size={16} className="music-icon-spin" />
          ) : (
            <Music size={16} />
          )}
          <span>{t.musicLabel}</span>
          {isMusicPlaying && <span className="music-live-indicator"></span>}
        </button>

        {/* Language Switcher (தமிழ் / ENG) */}
        <div className="lang-switcher-pill">
          <button
            className={`lang-choice ${lang === 'ta' ? 'active' : ''}`}
            onClick={() => setLang('ta')}
          >
            தமிழ்
          </button>
          <button
            className={`lang-choice ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            ENG
          </button>
        </div>
      </div>
    </nav>
  );
}
