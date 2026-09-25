import React from 'react';
import { Apple, Monitor, Terminal, Smartphone, Download, ShieldCheck, Zap, Layers, CheckCircle2 } from 'lucide-react';

const platforms = [
  {
    id: 'mac',
    name: 'Jinglee for Mac',
    tag: 'Apple Silicon & Intel',
    requirement: 'macOS 11.0 Big Sur or later',
    logoImg: '/platforms/mac_logo.png',
    icon: Apple,
    iconColor: '#1D1D1F',
    glowColor: '#B8860B',
    format: 'Universal DMG (.dmg)',
    size: '137 MB',
    security: 'Apple Gatekeeper Notarized',
    description: 'Native menubar utility. Hangs naturally beneath your Mac notch and screen edge with Apple Silicon hardware acceleration.',
    downloadActionName: 'Download for macOS (.dmg)',
    fileUrl: '/downloads/Lucky Dangle-1.0.0-arm64.dmg',
    fileName: 'Lucky-Dangle-1.0.0-mac.dmg'
  },
  {
    id: 'windows',
    name: 'Jinglee for Windows',
    tag: 'DirectX Accelerated',
    requirement: 'Windows 10 / 11 (64-bit)',
    logoImg: '/platforms/windows_logo.png',
    icon: Monitor,
    iconColor: '#0078D4',
    glowColor: '#0078D4',
    format: 'NSIS Installer (.exe)',
    size: '112 MB',
    security: 'Windows SmartScreen Verified',
    description: 'Runs silently in your Windows System Tray. Renders silky screen dangles with multi-monitor desktop support.',
    downloadActionName: 'Download for Windows (.exe)',
    fileUrl: '/downloads/Lucky Dangle Setup 1.0.0.exe',
    fileName: 'Lucky-Dangle-Setup-1.0.0.exe'
  },
  {
    id: 'linux',
    name: 'Jinglee for Linux',
    tag: 'Wayland & X11 Overlay',
    requirement: 'Ubuntu, Debian, Fedora, Arch',
    logoImg: '/platforms/ubuntu_logo.png',
    icon: Terminal,
    iconColor: '#E95420',
    glowColor: '#E95420',
    format: 'Universal Tarball (.tar.gz)',
    size: '135 MB',
    security: 'GPG Signature Verified',
    description: 'Universal portable standalone binary with transparent compositor overlay support for Wayland and X11 desktops.',
    downloadActionName: 'Download for Linux (.tar.gz)',
    fileUrl: '/downloads/lucky-dangle-1.0.0.tar.gz',
    fileName: 'lucky-dangle-1.0.0.tar.gz'
  },
  {
    id: 'android',
    name: 'Jinglee for Android',
    tag: 'Gyroscope Sensor Ready',
    requirement: 'Android 9.0 Pie or later',
    logoImg: '/platforms/android_logo.png',
    icon: Smartphone,
    iconColor: '#3DDC84',
    glowColor: '#3DDC84',
    format: 'Direct Package (.apk)',
    size: '33.2 MB',
    security: 'Google Play Protect Verified',
    description: 'Interactive screen talisman with gyroscopic tilt reaction, floating widget support, and countertop POS display modes.',
    downloadActionName: 'Download Android APK',
    fileUrl: '/downloads/Lucky Dangle-1.0.0.apk',
    fileName: 'Lucky-Dangle-1.0.0.apk'
  }
];

export default function DownloadsPage() {

  return (
    <div className="apple-page-wrapper downloads-view">
      {/* Apple Hero Header */}
      <section className="apple-hero-header">
        <span className="apple-category-eyebrow">Universal App · macOS · Windows · Linux · Android</span>
        <h1 className="apple-hero-title">Jinglee for all your devices.</h1>
        <p className="apple-hero-sub">
          Lightweight, native screen dangles crafted with zero background battery drain and 100% offline privacy.
        </p>
      </section>

      {/* Uniform Apple Rectangular Horizontal Split Cards Grid */}
      <section className="apple-platform-grid">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;

          return (
            <div key={platform.id} className="apple-platform-card">
              {/* Left Column: Platform Emblem Stage */}
              <div className="platform-card-stage">
                <div
                  className="platform-stage-glow"
                  style={{ backgroundColor: `${platform.glowColor}18` }}
                />
                <div className="platform-icon-circle" style={{ color: platform.iconColor }}>
                  {platform.logoImg ? (
                    <img
                      src={platform.logoImg}
                      alt={`${platform.name} logo`}
                      className="platform-custom-logo-img"
                    />
                  ) : (
                    <IconComponent size={36} strokeWidth={1.8} />
                  )}
                </div>
                <div className="platform-stage-shadow" />
              </div>

              {/* Right Column: Information, Tags & Action */}
              <div className="platform-card-content">
                {/* Top Meta Tag Row */}
                <div className="platform-meta-row">
                  <span className="platform-tag-pill">{platform.tag}</span>
                  <span className="platform-size-chip">{platform.size}</span>
                </div>

                {/* Title & Description */}
                <div className="platform-text-body">
                  <h3 className="platform-product-title">{platform.name}</h3>
                  <p className="platform-product-desc">{platform.description}</p>
                </div>

                {/* Requirement & Specs Info */}
                <div className="platform-sub-req">
                  <span>{platform.requirement}</span> • <span>{platform.format}</span>
                </div>

                {/* Action Row */}
                <div className="platform-action-row">
                  <a
                    href={platform.fileUrl}
                    download={platform.fileName}
                    className="platform-download-cta"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    <Download size={15} className="btn-icon" />
                    <span>{platform.downloadActionName}</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Apple Tech Specs Comparative Table */}
      <section className="apple-specs-table-section">
        <h2 className="apple-section-headline">Compare Platform Capabilities</h2>
        <p className="apple-section-subline">Engineered uniformly across operating systems with platform-native optimizations.</p>

        <div className="apple-tech-table-wrapper">
          <table className="apple-tech-table">
            <thead>
              <tr>
                <th>Feature / Spec</th>
                <th>macOS</th>
                <th>Windows</th>
                <th>Linux</th>
                <th>Android</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature-cell">Menubar / Tray Integration</td>
                <td><CheckCircle2 size={16} className="check-green" /> Native Menu Bar</td>
                <td><CheckCircle2 size={16} className="check-green" /> System Tray</td>
                <td><CheckCircle2 size={16} className="check-green" /> AppIndicator</td>
                <td><CheckCircle2 size={16} className="check-green" /> Widget / Overlay</td>
              </tr>
              <tr>
                <td className="feature-cell">Physics Engine</td>
                <td>Matter.js 60fps / 120Hz ProMotion</td>
                <td>Matter.js 60fps</td>
                <td>Matter.js 60fps</td>
                <td>Matter.js + Gyroscope</td>
              </tr>
              <tr>
                <td className="feature-cell">Cursor Shyness Reaction</td>
                <td><CheckCircle2 size={16} className="check-green" /> Smooth Reluctance</td>
                <td><CheckCircle2 size={16} className="check-green" /> Smooth Reluctance</td>
                <td><CheckCircle2 size={16} className="check-green" /> Smooth Reluctance</td>
                <td><CheckCircle2 size={16} className="check-green" /> Multi-touch & Tilt</td>
              </tr>
              <tr>
                <td className="feature-cell">Memory & CPU Footprint</td>
                <td>~45 MB RAM (&lt; 0.5% CPU)</td>
                <td>~48 MB RAM (&lt; 0.8% CPU)</td>
                <td>~42 MB RAM (&lt; 0.6% CPU)</td>
                <td>~28 MB RAM</td>
              </tr>
              <tr>
                <td className="feature-cell">Offline & Security</td>
                <td>Apple Notarized · 0 Telemetry</td>
                <td>Code Signed · 0 Telemetry</td>
                <td>GPG Verified · 0 Telemetry</td>
                <td>Play Protect · 0 Telemetry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Apple-Grade Three Feature Pillars */}
      <section className="apple-specs-section">
        <h2 className="apple-section-headline">Engineered for pure efficiency.</h2>

        <div className="apple-feature-columns">
          <div className="apple-feature-item">
            <div className="feature-icon-circle">
              <Zap size={20} />
            </div>
            <h3>Under 1% CPU Usage</h3>
            <p>
              Suspends physics calculations automatically when idle. Zero battery drain on MacBook and laptops.
            </p>
          </div>

          <div className="apple-feature-item">
            <div className="feature-icon-circle">
              <Layers size={20} />
            </div>
            <h3>Auto-Hides in Fullscreen</h3>
            <p>
              Intelligently detects fullscreen videos, games, and presentation mode, tucking itself away seamlessly.
            </p>
          </div>

          <div className="apple-feature-item">
            <div className="feature-icon-circle">
              <ShieldCheck size={20} />
            </div>
            <h3>100% Private & Offline</h3>
            <p>
              No network requests, zero telemetry, and zero tracking. Your desktop space remains completely yours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
