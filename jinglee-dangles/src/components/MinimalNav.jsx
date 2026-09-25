import React, { useState, useEffect, useRef } from 'react';
import { Apple, User, Sparkles, LogOut, ChevronDown, Grid, Download, Info } from 'lucide-react';

export default function MinimalNav({ activePage, onNavigate, user, onOpenAuth, onOpenPricing, onSignOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subnavOpen, setSubnavOpen] = useState(false);
  const navContainerRef = useRef(null);

  const handleNav = (pageId) => {
    onNavigate(pageId);
    setSubnavOpen(false);
  };

  // Close subnav and user dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target)) {
        setSubnavOpen(false);
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSubnavOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="apple-nav-wrapper" ref={navContainerRef}>
      {/* Primary Sticky Header */}
      <header className="apple-global-nav">
        <div className="apple-nav-container apple-nav-centered-layout">
          
          {/* Left Slot: Clean visual balance spacer */}
          <div className="apple-nav-left-slot">
            {/* Kept uncluttered so header feels open and balanced */}
          </div>

          {/* Center: Hero Brand Logo */}
          <div className="apple-nav-brand apple-nav-brand-centered" onClick={() => handleNav('collections')} role="button" tabIndex={0}>
            <img src="/jinglee.png" alt="Jinglee" className="brand-logo-img" />
          </div>

          {/* Right Slot: User Auth & CTA */}
          <div className="apple-nav-right">
            {user ? (
              <div className="nav-user-dropdown-wrapper">
                <button
                  type="button"
                  className="nav-user-pill-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img src={user.avatarUrl} alt={user.displayName} className="nav-user-avatar" />
                  <span className="nav-user-name desktop-nav-only">{user.displayName.split(' ')[0]}</span>
                  <ChevronDown size={14} className="desktop-nav-only" />
                </button>

                {dropdownOpen && (
                  <div className="nav-user-menu" onClick={() => setDropdownOpen(false)}>
                    <div className="menu-header-item">
                      <strong>{user.displayName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="menu-divider" />
                    <button className="menu-item" onClick={() => onNavigate('profile')}>
                      <User size={15} />
                      <span>My Profile & Devices</span>
                    </button>
                    <button className="menu-item" onClick={onOpenPricing}>
                      <Sparkles size={15} />
                      <span>Subscription ({user.planTier || 'Pro'})</span>
                    </button>
                    <div className="menu-divider" />
                    <button className="menu-item signout" onClick={onSignOut}>
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="google-nav-icon-btn"
                onClick={onOpenAuth}
                title="Sign In with Google"
                aria-label="Sign In with Google"
              >
                <svg viewBox="0 0 24 24" width="17" height="17">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              className="apple-nav-icon-btn"
              onClick={() => handleNav('downloads')}
              title="Get Jinglee App"
              aria-label="Get Jinglee App"
            >
              <Apple size={16} />
            </button>
          </div>
        </div>

        {/* Small Dropdown Tab Button directly anchored beneath the header bar */}
        <div className="apple-subnav-trigger-container">
          <button
            type="button"
            className={`apple-subnav-dropdown-tab ${subnavOpen ? 'is-open' : ''}`}
            onClick={() => setSubnavOpen(!subnavOpen)}
            aria-expanded={subnavOpen}
            aria-label="Toggle navigation bar"
          >
            <ChevronDown size={14} className={`tab-chevron ${subnavOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </header>

      {/* Horizontal Sub-Header Bar (Slides down horizontally with Apple Segmented Pill Control) */}
      <nav className={`apple-horizontal-subnav-bar ${subnavOpen ? 'is-expanded' : ''}`} aria-label="Sub navigation">
        <div className="subnav-inner-container">
          <div className="apple-segmented-pills-track">
            <button
              type="button"
              className={`apple-pill-btn ${activePage === 'collections' ? 'is-active' : ''}`}
              onClick={() => handleNav('collections')}
            >
              <Grid size={13} className="pill-icon" />
              <span>Collections</span>
            </button>

            <button
              type="button"
              className={`apple-pill-btn ${activePage === 'downloads' ? 'is-active' : ''}`}
              onClick={() => handleNav('downloads')}
            >
              <Download size={13} className="pill-icon" />
              <span>Downloads</span>
            </button>

            <button
              type="button"
              className={`apple-pill-btn ${activePage === 'about' ? 'is-active' : ''}`}
              onClick={() => handleNav('about')}
            >
              <Info size={13} className="pill-icon" />
              <span>About</span>
            </button>

            <button
              type="button"
              className={`apple-pill-btn ${activePage === 'profile' ? 'is-active' : ''}`}
              onClick={() => handleNav('profile')}
            >
              <User size={13} className="pill-icon" />
              <span>Profile & Devices</span>
            </button>

            <button
              type="button"
              className="apple-pill-btn apple-pill-cta"
              onClick={() => handleNav('downloads')}
            >
              <Apple size={13} className="pill-icon" />
              <span>Get App</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}


