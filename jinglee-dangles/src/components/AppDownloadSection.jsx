import React from 'react';
import { Apple, Monitor, Smartphone, Download, ShieldCheck, Zap } from 'lucide-react';

export default function AppDownloadSection() {
  return (
    <section id="downloads" className="minimal-download-section">
      <div className="download-card-hero">
        <div className="download-badge">
          <Zap size={14} />
          <span>Desktop & Mobile Ecosystem</span>
        </div>

        <h2 className="download-heading">
          Get Jinglee on your Mac & Windows.
        </h2>

        <p className="download-subheading">
          Run your favorite cultural charm right on your macOS menubar or Windows system tray. 
          Lightweight, zero CPU drain, and full physics.
        </p>

        <div className="download-buttons-cluster">
          <button
            className="btn-download-main"
            onClick={() => alert('🍎 Downloading Jinglee for macOS (.dmg, Universal ARM/Intel)...')}
          >
            <Apple size={20} />
            <div className="btn-text-group">
              <span className="btn-sub">Download for</span>
              <span className="btn-main">macOS Menubar</span>
            </div>
          </button>

          <button
            className="btn-download-sec"
            onClick={() => alert('🪟 Downloading Jinglee for Windows (.exe installer)...')}
          >
            <Monitor size={20} />
            <div className="btn-text-group">
              <span className="btn-sub">Download for</span>
              <span className="btn-main">Windows Tray</span>
            </div>
          </button>
        </div>

        <div className="download-guarantees">
          <div className="guarantee-item">
            <ShieldCheck size={16} />
            <span>Apple Notarized & Safe</span>
          </div>
          <div className="guarantee-item">
            <Zap size={16} />
            <span>Under 1% Battery & CPU Usage</span>
          </div>
          <div className="guarantee-item">
            <Monitor size={16} />
            <span>Auto-Hides in Fullscreen Apps</span>
          </div>
        </div>
      </div>
    </section>
  );
}
