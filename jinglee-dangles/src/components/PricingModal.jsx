import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { googleAuthService } from '../services/googleAuthService';

export default function PricingModal({ isOpen, onClose, user, onUpgradeSuccess }) {
  const [selectedTier, setSelectedTier] = useState('pro');
  const [processing, setProcessing] = useState(false);
  const [successState, setSuccessState] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = (tierName, price) => {
    setProcessing(true);
    // Simulate Razorpay / Payment Gateway checkout
    setTimeout(() => {
      googleAuthService.upgradeSubscription(tierName, {
        paymentId: 'pay_' + Math.random().toString(36).substring(2, 9),
        amount: price,
        date: new Date().toISOString()
      });
      setProcessing(false);
      setSuccessState(true);
      setTimeout(() => {
        if (onUpgradeSuccess) onUpgradeSuccess();
        onClose();
      }, 1400);
    }, 900);
  };

  return (
    <div className="apple-modal-backdrop" onClick={onClose}>
      <div className="apple-pricing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="apple-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {successState ? (
          <div className="pricing-success-view">
            <div className="success-icon-badge">
              <Check size={32} />
            </div>
            <h2>Subscription Activated!</h2>
            <p>Your account has been upgraded to <strong>{selectedTier === 'pro' ? 'Pro Set Cluster' : 'Enterprise Mesh'}</strong>. All registered devices have received unlocked entitlements.</p>
          </div>
        ) : (
          <>
            <div className="apple-pricing-header">
              <span className="pricing-mini-badge">Pricing & Plans</span>
              <h2>Unlock the Full Jinglee Experience</h2>
              <p>One unified subscription across all your macOS, Android, Windows, and Web screens.</p>
            </div>

            <div className="pricing-grid-modal">
              {/* STARTER FREE */}
              <div className={`modal-plan-card ${selectedTier === 'starter' ? 'active' : ''}`} onClick={() => setSelectedTier('starter')}>
                <div className="plan-header">
                  <span className="plan-name">Free Starter</span>
                  <div className="plan-price">
                    <span className="curr">₹</span>0
                    <span className="period">/ lifetime</span>
                  </div>
                </div>
                <p className="plan-desc">For individual users enjoying standard cultural dangles.</p>
                <ul className="plan-features">
                  <li><Check size={14} /> 1 Active Screen Device</li>
                  <li><Check size={14} /> Classic Dangle Catalog</li>
                  <li><Check size={14} /> Zero-Gravity Physics</li>
                </ul>
                <button className="plan-btn secondary" disabled>
                  Current Plan
                </button>
              </div>

              {/* PRO PLAN */}
              <div className={`modal-plan-card popular ${selectedTier === 'pro' ? 'active' : ''}`} onClick={() => setSelectedTier('pro')}>
                <div className="popular-tag">Most Popular</div>
                <div className="plan-header">
                  <span className="plan-name">Pro Set Cluster</span>
                  <div className="plan-price">
                    <span className="curr">₹</span>7,999
                    <span className="period">/ year</span>
                  </div>
                </div>
                <p className="plan-desc">Unlimited screens, Bubu & Dudu anime pack, & custom charms.</p>
                <ul className="plan-features">
                  <li><Check size={14} /> Up to 5 Registered Devices</li>
                  <li><Check size={14} /> All 19 Bubu & Dudu Dynamic Charms</li>
                  <li><Check size={14} /> Instant 6-Digit PIN Device Sync</li>
                  <li><Check size={14} /> Priority Audio Bells & Shaders</li>
                </ul>
                <button
                  className="plan-btn primary"
                  onClick={() => handleCheckout('Pro Set Cluster', 7999)}
                  disabled={processing}
                >
                  {processing && selectedTier === 'pro' ? 'Processing...' : 'Upgrade with Razorpay'}
                </button>
              </div>

              {/* ENTERPRISE */}
              <div className={`modal-plan-card ${selectedTier === 'enterprise' ? 'active' : ''}`} onClick={() => setSelectedTier('enterprise')}>
                <div className="plan-header">
                  <span className="plan-name">Enterprise Mesh</span>
                  <div className="plan-price">
                    <span className="curr">₹</span>19,999
                    <span className="period">/ year</span>
                  </div>
                </div>
                <p className="plan-desc">For merchant counters, multi-lane POS terminals & branding.</p>
                <ul className="plan-features">
                  <li><Check size={14} /> Unlimited POS Terminals</li>
                  <li><Check size={14} /> Dynamic UPI QR & Soundbox</li>
                  <li><Check size={14} /> Custom Brand Dangle 3D Shaders</li>
                  <li><Check size={14} /> 24/7 Dedicated Support</li>
                </ul>
                <button
                  className="plan-btn secondary"
                  onClick={() => handleCheckout('Enterprise Mesh', 19999)}
                  disabled={processing}
                >
                  {processing && selectedTier === 'enterprise' ? 'Processing...' : 'Upgrade with Razorpay'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
