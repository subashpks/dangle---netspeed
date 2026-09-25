import React, { useState, useEffect, useRef } from 'react';
import MinimalNav from './components/MinimalNav';
import LiveDangleOverlay from './components/LiveDangleOverlay';
import ZenFocusStageBar from './components/ZenFocusStageBar';
import CollectionsPage from './pages/CollectionsPage';
import DownloadsPage from './pages/DownloadsPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import GoogleAuthModal from './components/GoogleAuthModal';
import PricingModal from './components/PricingModal';
import { realCharmsList } from './data/realCharmsCatalog';
import { googleAuthService } from './services/googleAuthService';

export default function App() {
  // Sync initial page with clean URL pathname
  const getInitialPage = () => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path === 'downloads' || path === 'about' || path === 'profile') return path;
    const hash = window.location.hash.replace('#', '');
    if (hash === 'downloads' || hash === 'about' || hash === 'profile') return hash;
    return 'collections';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [activeCharm, setActiveCharm] = useState(realCharmsList[0]); // Default to Balaji Classic
  const [user, setUser] = useState(googleAuthService.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const unsubscribe = googleAuthService.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (path === 'downloads' || path === 'about' || path === 'collections' || path === 'profile') {
        setActivePage(path);
      } else {
        setActivePage('collections');
      }
      setIsZenMode(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Gesture & Scroll listeners to restore background when user swipes up or scrolls
  useEffect(() => {
    if (!isZenMode) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 8) {
        setIsZenMode(false);
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const deltaY = touchStartYRef.current - e.touches[0].clientY;
        // Swipe up by 25px or swipe down by 25px exits Zen mode smoothly
        if (Math.abs(deltaY) > 25) {
          setIsZenMode(false);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        setIsZenMode(false);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZenMode]);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    setIsZenMode(false);
    const targetPath = pageId === 'collections' ? '/' : `/${pageId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: pageId }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCharm = (charm) => {
    setActiveCharm(charm);
    setIsZenMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await googleAuthService.signOut();
    handleNavigate('collections');
  };

  return (
    <div className={`apple-app-container ${isZenMode ? 'is-zen-focus-active' : ''}`}>
      {/* 1. PERSISTENT LIVE HANGING DANGLE OVERLAY */}
      <LiveDangleOverlay
        activeCharm={activeCharm}
        onSwitchCharm={setActiveCharm}
        isZenMode={isZenMode}
      />

      {/* 2. Apple Frosted Glass Navbar with Google Auth */}
      <MinimalNav
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPricing={() => setPricingModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* 3. Page Content Area */}
      <main className={`apple-main-viewport ${isZenMode ? 'zen-dimmed-content' : ''}`}>
        {activePage === 'collections' && (
          <CollectionsPage
            activeCharm={activeCharm}
            onSelectCharm={handleSelectCharm}
          />
        )}

        {activePage === 'downloads' && (
          <DownloadsPage />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            user={user}
            onSignOut={handleSignOut}
            onOpenPricing={() => setPricingModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* 4. Zen Focus Stage Floating Control Bar */}
      {isZenMode && (
        <ZenFocusStageBar
          activeCharm={activeCharm}
          onExitZen={() => setIsZenMode(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* 4. Google Sign In / Sign Up Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          handleNavigate('profile');
        }}
      />

      {/* 5. Pricing & Subscription Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        user={user}
        onUpgradeSuccess={() => setUser(googleAuthService.getCurrentUser())}
      />

      {/* 6. Apple Minimalist Footer */}
      <footer className="apple-minimal-footer">
        <div className="apple-footer-inner">
          <div className="apple-footer-brand" onClick={() => handleNavigate('collections')}>
            <span className="brand-crest-emoji">🪔</span>
            <strong>Jinglee</strong>
          </div>

          <div className="apple-footer-nav-links">
            <button
              className={`footer-text-link ${activePage === 'collections' ? 'active' : ''}`}
              onClick={() => handleNavigate('collections')}
            >
              Collections
            </button>
            <button
              className={`footer-text-link ${activePage === 'downloads' ? 'active' : ''}`}
              onClick={() => handleNavigate('downloads')}
            >
              Downloads
            </button>
            <button
              className={`footer-text-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={() => handleNavigate('about')}
            >
              About
            </button>
            <button
              className={`footer-text-link ${activePage === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavigate('profile')}
            >
              Profile & Devices
            </button>
          </div>

          <p className="apple-footer-copyright">
            Copyright © 2026 Jinglee Technologies. Handcrafted for modern screens.
          </p>
        </div>
      </footer>
    </div>
  );
}

