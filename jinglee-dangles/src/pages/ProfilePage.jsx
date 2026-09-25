import React, { useState, useEffect } from 'react';
import { 
  User, 
  Smartphone, 
  Laptop, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  LogOut, 
  RefreshCw, 
  Key,
  Copy
} from 'lucide-react';
import { googleAuthService } from '../services/googleAuthService';

export default function ProfilePage({ user, onSignOut, onOpenPricing, onOpenAuth }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Devices state
  const [devices, setDevices] = useState([]);
  const [pairingCodeInfo, setPairingCodeInfo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pairingDeviceName, setPairingDeviceName] = useState('');
  const [pairingPlatform, setPairingPlatform] = useState('Android');
  const [showPairModal, setShowPairModal] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setDevices(googleAuthService.getRegisteredDevices());
    }
  }, [user]);

  if (!user) {
    return (
      <div className="apple-profile-unauth-container">
        <div className="apple-profile-unauth-card">
          <div className="unauth-icon-badge">
            <span className="brand-crest-emoji">🪔</span>
          </div>
          <h2>Sign in to view your Profile</h2>
          <p>Sign in with your Google account to manage registered devices, edit your profile, and manage your subscription.</p>
          <button className="google-sso-btn" onClick={onOpenAuth}>
            <svg className="google-svg-logo" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await googleAuthService.updateProfile({ displayName, bio });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleGeneratePairingCode = () => {
    const codeData = googleAuthService.generatePairingCode();
    setPairingCodeInfo(codeData);
    setShowPairModal(true);
  };

  const handleCopyCode = () => {
    if (pairingCodeInfo) {
      navigator.clipboard.writeText(pairingCodeInfo.raw);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    }
  };

  const handleSimulateDevicePair = (e) => {
    e.preventDefault();
    if (!pairingDeviceName) return;
    googleAuthService.pairDevice(pairingDeviceName, pairingPlatform);
    setDevices(googleAuthService.getRegisteredDevices());
    setShowPairModal(false);
    setPairingDeviceName('');
  };

  const handleRevokeDevice = (deviceId) => {
    const updated = googleAuthService.revokeDevice(deviceId);
    setDevices(updated);
  };

  return (
    <div className="apple-profile-page-wrapper">
      <div className="apple-profile-page-container">
        {/* TOP HEADER / HERO */}
        <div className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-avatar-container">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="profile-avatar-img"
              />
              <div className="google-badge-overlay" title="Verified with Google">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            </div>

            <div className="profile-meta-info">
              <div className="profile-name-row">
                <h1>{user.displayName}</h1>
                <span className="profile-verified-chip">
                  <ShieldCheck size={14} /> Google Verified
                </span>
              </div>
              <p className="profile-email-text">{user.email}</p>
              <p className="profile-bio-text">{user.bio || 'Passionate about cultural dangles and zero-gravity screen physics.'}</p>
            </div>
          </div>

          <div className="profile-hero-actions">
            <button className="profile-edit-btn" onClick={() => setIsEditing(!isEditing)}>
              <Edit3 size={15} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button className="profile-signout-btn" onClick={onSignOut}>
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* PROFILE EDIT DRAWER */}
        {isEditing && (
          <form className="profile-edit-form-card" onSubmit={handleSaveProfile}>
            <div className="form-header">
              <h3>Edit Profile Details</h3>
              <p>Update how your name and bio appear across your registered screens.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Subash K."
                  required
                />
              </div>
              <div className="form-group">
                <label>Bio & Notes</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your screen setup..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-profile-btn">
                <Check size={16} /> Save Changes
              </button>
              <button type="button" className="cancel-edit-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="profile-toast-alert">
            <Check size={16} /> Profile updated successfully!
          </div>
        )}

        {/* TWO-COLUMN DASHBOARD (DEVICE REGISTRATION + SUBSCRIPTION) */}
        <div className="profile-columns-layout">
          {/* LEFT: REGISTERED DEVICES */}
          <div className="profile-section-card devices-section">
            <div className="section-card-header">
              <div>
                <h3>📱 Registered Hardware Devices</h3>
                <p>Manage the screens currently synced to your account.</p>
              </div>
              <button className="pair-device-cta-btn" onClick={handleGeneratePairingCode}>
                <Plus size={15} />
                <span>Pair New Device</span>
              </button>
            </div>

            <div className="devices-list">
              {devices.map((device) => (
                <div key={device.id} className="device-item-card">
                  <div className="device-platform-icon">
                    {device.platform === 'macOS' || device.platform === 'Windows' ? (
                      <Laptop size={22} />
                    ) : (
                      <Smartphone size={22} />
                    )}
                  </div>
                  <div className="device-details">
                    <div className="device-name-row">
                      <strong>{device.deviceName}</strong>
                      <span className="device-status-badge active">Active</span>
                    </div>
                    <div className="device-sub-meta">
                      <span>{device.platform}</span> • <span>Synced: {device.lastSyncedAt}</span> • <span>IP: {device.ipAddress}</span>
                    </div>
                  </div>
                  <button
                    className="device-revoke-btn"
                    title="Revoke / Remove Device"
                    onClick={() => handleRevokeDevice(device.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SUBSCRIPTION & PLAN DETAILS */}
          <div className="profile-section-card subscription-section">
            <div className="section-card-header">
              <div>
                <h3>💳 Subscription & Entitlements</h3>
                <p>Your current Jinglee tier and connected services.</p>
              </div>
            </div>

            <div className="active-tier-display">
              <div className="tier-badge-pill">
                <Sparkles size={16} /> {user.planTier || 'Pro Set Cluster'}
              </div>
              <p className="tier-expiry-note">
                Valid through <strong>{user.planExpiry || 'December 31, 2027'}</strong>
              </p>

              <div className="tier-perks-list">
                <div className="tier-perk-item">
                  <Check size={16} className="perk-check" />
                  <span>All 65 Cultural, Meme, & Bubu Dudu Charms unlocked</span>
                </div>
                <div className="tier-perk-item">
                  <Check size={16} className="perk-check" />
                  <span>Zero-Gravity Realtime Physics Engine enabled</span>
                </div>
                <div className="tier-perk-item">
                  <Check size={16} className="perk-check" />
                  <span>Multi-Screen Instant PIN Sync</span>
                </div>
              </div>

              <div className="subscription-card-actions">
                <button className="upgrade-tier-btn" onClick={onOpenPricing}>
                  <CreditCard size={16} />
                  <span>Manage / Upgrade Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DEVICE PAIRING PIN MODAL */}
        {showPairModal && pairingCodeInfo && (
          <div className="apple-modal-backdrop" onClick={() => setShowPairModal(false)}>
            <div className="apple-pair-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pair-modal-header">
                <Key size={28} className="pair-modal-icon" />
                <h3>Link a New Device</h3>
                <p>Enter this 6-digit PIN on your Android phone, Mac, or Windows screen.</p>
              </div>

              <div className="pairing-pin-display">
                <span className="pin-text">{pairingCodeInfo.code}</span>
                <button className="copy-pin-btn" onClick={handleCopyCode} title="Copy Code">
                  {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <span className="pin-expiry-text">Code expires in 5 minutes</span>

              <div className="simulate-pair-form">
                <h4>Or test register device now:</h4>
                <form onSubmit={handleSimulateDevicePair}>
                  <input
                    type="text"
                    placeholder="Device name (e.g. Subash's iPad / Android)"
                    value={pairingDeviceName}
                    onChange={(e) => setPairingDeviceName(e.target.value)}
                    required
                  />
                  <div className="platform-select-row">
                    <button
                      type="button"
                      className={`platform-pill ${pairingPlatform === 'Android' ? 'active' : ''}`}
                      onClick={() => setPairingPlatform('Android')}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      className={`platform-pill ${pairingPlatform === 'macOS' ? 'active' : ''}`}
                      onClick={() => setPairingPlatform('macOS')}
                    >
                      macOS
                    </button>
                    <button
                      type="button"
                      className={`platform-pill ${pairingPlatform === 'Windows' ? 'active' : ''}`}
                      onClick={() => setPairingPlatform('Windows')}
                    >
                      Windows
                    </button>
                  </div>
                  <button type="submit" className="complete-pair-btn">
                    Register Device
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
