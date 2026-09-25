import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { googleAuthService } from '../services/googleAuthService';

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { user } = await googleAuthService.signInWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="apple-modal-backdrop" onClick={onClose}>
      <div className="apple-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="apple-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="apple-auth-header">
          <div className="apple-auth-badge">
            <span className="brand-crest-emoji">🪔</span>
            <span>Jinglee Account</span>
          </div>
          <h2>{authMode === 'signup' ? 'Create your Jinglee account' : 'Welcome back to Jinglee'}</h2>
          <p>
            {authMode === 'signup'
              ? 'Sign up with Google to sync live dangles, register devices, and manage subscriptions.'
              : 'Sign in with Google to access your registered devices and active charms.'}
          </p>
        </div>

        {/* 1-CLICK GOOGLE SIGN IN / SIGN UP BUTTON */}
        <div className="apple-auth-actions">
          <button 
            className="google-sso-btn"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            {loading ? (
              <div className="sso-loading-spinner" />
            ) : (
              <svg className="google-svg-logo" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{authMode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          <div className="apple-auth-divider">
            <span>Instant & Secure via Google OAuth 2.0</span>
          </div>

          <div className="apple-auth-features">
            <div className="auth-feature-row">
              <ShieldCheck size={16} className="feature-icon" />
              <span>Multi-device hardware registration & instant PIN sync</span>
            </div>
            <div className="auth-feature-row">
              <Sparkles size={16} className="feature-icon" />
              <span>All 65 cultural & anime dangles unlocked across Android & Desktop</span>
            </div>
          </div>
        </div>

        <div className="apple-auth-footer">
          {authMode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button className="auth-switch-link" onClick={() => setAuthMode('signin')}>
                Sign in with Google
              </button>
            </p>
          ) : (
            <p>
              New to Jinglee?{' '}
              <button className="auth-switch-link" onClick={() => setAuthMode('signup')}>
                Sign up with Google
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
