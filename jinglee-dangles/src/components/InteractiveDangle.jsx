import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Volume2, MoveHorizontal, Wind, Gauge, RotateCcw } from 'lucide-react';

export default function InteractiveDangle({ activeDangle, onPlayChime, lang, t }) {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [windEnabled, setWindEnabled] = useState(true);
  const [decayFresh, setDecayFresh] = useState(true);
  const containerRef = useRef(null);
  const animRef = useRef(null);

  const physicsRef = useRef({
    angle: 0.12,
    angularVelocity: 0,
    damping: 0.988,
    gravity: 0.0035,
    windTime: 0
  });

  useEffect(() => {
    const loop = () => {
      physicsRef.current.windTime += 0.025;

      if (!isDragging) {
        // Natural pendulum acceleration: -g * sin(theta)
        const accel = -physicsRef.current.gravity * Math.sin(physicsRef.current.angle);
        physicsRef.current.angularVelocity += accel;

        // Zero-gravity wind breeze
        if (windEnabled) {
          const breeze = Math.sin(physicsRef.current.windTime * 1.5) * 0.0006 + Math.cos(physicsRef.current.windTime * 2.7) * 0.0003;
          physicsRef.current.angularVelocity += breeze;
        }

        physicsRef.current.angularVelocity *= physicsRef.current.damping;
        physicsRef.current.angle += physicsRef.current.angularVelocity;

        setAngle(physicsRef.current.angle);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isDragging, windEnabled]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateAngleFromEvent(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updateAngleFromEvent(e);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      physicsRef.current.angularVelocity = (Math.random() - 0.5) * 0.04;
      if (onPlayChime) onPlayChime(activeDangle.chimeFreq);
    }
  };

  const updateAngleFromEvent = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pivotX = rect.left + rect.width / 2;
    const pivotY = rect.top + 32;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

    if (clientX !== undefined && clientY !== undefined) {
      const dx = clientX - pivotX;
      const dy = clientY - pivotY;
      const rawAngle = Math.atan2(dx, Math.max(dy, 40));
      const clampedAngle = Math.max(-1.15, Math.min(1.15, rawAngle));
      physicsRef.current.angle = clampedAngle;
      physicsRef.current.angularVelocity = 0;
      setAngle(clampedAngle);
    }
  };

  const angleDeg = (angle * 180) / Math.PI;

  return (
    <div className="desktop-simulator-wrapper">
      {/* Simulated Desktop Menubar */}
      <div className="simulated-menubar">
        <div className="menubar-left">
          <span className="apple-logo"></span>
          <span className="menubar-title">Finder</span>
          <span className="menubar-item">File</span>
          <span className="menubar-item">Edit</span>
          <span className="menubar-item">View</span>
          <span className="menubar-item">Dangles</span>
        </div>
        <div className="menubar-right">
          <span className="menubar-active-dangle-badge">
            <span className="pulse-dot-mini"></span>
            {activeDangle.name[lang].split('(')[0]}
          </span>
          <span className="menubar-item">100% 🔋</span>
          <span className="menubar-item">Sat 10:42 AM</span>
        </div>
      </div>

      {/* Interactive Physics Viewport */}
      <div
        className="interactive-dangle-stage"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Top Gold Screen Edge Mount */}
        <div className="dangle-screen-mount">
          <div className="mount-clip"></div>
          <div className="mount-golden-bead"></div>
        </div>

        {/* Swinging Pendulum Unit */}
        <div
          className="dangle-pendulum"
          style={{
            transform: `rotate(${angleDeg}deg)`,
            transformOrigin: 'top center'
          }}
        >
          {/* Sacred Silk Thread & Beads */}
          <div className="dangle-cord">
            <div className="bead-accent bead-1"></div>
            <div className="bead-accent bead-2"></div>
            <div className="bead-accent bead-3"></div>
          </div>

          {/* Dangle Charm Body */}
          <div className="dangle-charm-body">
            <div className="charm-aura-glow"></div>

            <div className="charm-icon-wrapper" style={{ borderColor: activeDangle.color }}>
              {/* Dynamic Charm Artworks */}
              {activeDangle.id.startsWith('balaji') && (
                <div className="charm-art balaji-art">
                  <div className="balaji-crown"></div>
                  <div className="balaji-namam">
                    <span className="namam-u">U</span>
                    <span className="namam-red">|</span>
                  </div>
                  <div className="balaji-garland"></div>
                </div>
              )}

              {activeDangle.id === 'krishna_flute' && (
                <div className="charm-art krishna-art">
                  <div className="krishna-peacock-crown">🪶</div>
                  <div className="krishna-flute-bar"></div>
                </div>
              )}

              {activeDangle.id === 'murugan_vel_pendant' && (
                <div className="charm-art vel-art">
                  <div className="vel-blade">
                    <div className="vibhuti-line"></div>
                    <div className="vibhuti-line"></div>
                    <div className="vibhuti-line"></div>
                    <div className="kumkum-bindu"></div>
                  </div>
                  <div className="vel-shaft"></div>
                </div>
              )}

              {activeDangle.id === 'shiva_gold_nataraj' && (
                <div className="charm-art nataraja-art">
                  <div className="fire-ring"></div>
                  <div className="nataraja-pose"></div>
                </div>
              )}

              {activeDangle.id === 'shiva_shivling' && (
                <div className="charm-art shivling-art">
                  <div className="naga-hood"></div>
                  <div className="lingam-stone">
                    <div className="vibhuti-line" style={{ width: '10px' }}></div>
                  </div>
                </div>
              )}

              {activeDangle.id === 'nimbu' && (
                <div className="charm-art nimbu-art">
                  <div className="chilli-row">
                    <span className="chilli">🌶️</span>
                    <span className="chilli">🌶️</span>
                    <span className="chilli">🌶️</span>
                  </div>
                  <div className="lemon-orb">🍋</div>
                  <div className="chilli-row">
                    <span className="chilli">🌶️</span>
                    <span className="chilli">🌶️</span>
                  </div>
                </div>
              )}

              {activeDangle.id === 'drishti' && (
                <div className="charm-art drishti-art">
                  <span style={{ fontSize: '2.4rem' }}>👹</span>
                </div>
              )}

              {activeDangle.id === 'nazar' && (
                <div className="charm-art nazar-art">
                  <div className="nazar-outer-blue">
                    <div className="nazar-white-ring">
                      <div className="nazar-cyan-ring">
                        <div className="nazar-pupil"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDangle.id === 'hamsa' && (
                <div className="charm-art hamsa-art">
                  <span style={{ fontSize: '2.4rem' }}>🖐️</span>
                </div>
              )}

              {activeDangle.id.startsWith('christian') && (
                <div className="charm-art cross-art">
                  <div className="gold-cross-vertical"></div>
                  <div className="gold-cross-horizontal"></div>
                </div>
              )}

              {activeDangle.id.startsWith('islam') && (
                <div className="charm-art islam-art">
                  <div className="gold-crescent-moon">
                    <span className="star-point">★</span>
                  </div>
                </div>
              )}

              {activeDangle.id.startsWith('sai') && (
                <div className="charm-art sai-art">
                  <span style={{ fontSize: '2.4rem' }}>🪔</span>
                </div>
              )}

              {activeDangle.id.startsWith('meme') && (
                <div className="charm-art meme-art">
                  <span style={{ fontSize: '2.4rem' }}>{activeDangle.iconEmoji}</span>
                </div>
              )}

              {/* Fallback Emoji */}
              {!activeDangle.id.startsWith('balaji') &&
                activeDangle.id !== 'krishna_flute' &&
                activeDangle.id !== 'murugan_vel_pendant' &&
                activeDangle.id !== 'shiva_gold_nataraj' &&
                activeDangle.id !== 'shiva_shivling' &&
                activeDangle.id !== 'nimbu' &&
                activeDangle.id !== 'drishti' &&
                activeDangle.id !== 'nazar' &&
                activeDangle.id !== 'hamsa' &&
                !activeDangle.id.startsWith('christian') &&
                !activeDangle.id.startsWith('islam') &&
                !activeDangle.id.startsWith('sai') &&
                !activeDangle.id.startsWith('meme') && (
                  <span style={{ fontSize: '2.2rem' }}>{activeDangle.iconEmoji || '🪔'}</span>
                )}
            </div>

            {/* Bottom Ghungroo Tassels */}
            <div className="bottom-tassels">
              <div className="tassel-bead"></div>
              <div className="tassel-ghungroo"></div>
            </div>
          </div>
        </div>

        {/* Live Interactive Action Controls (Simulating Charm Actions) */}
        <div className="simulator-actions-bar">
          <div className="dangle-interactive-hint">
            <MoveHorizontal size={14} style={{ color: '#D4AF37' }} />
            <span>{t.swingInstruction}</span>
          </div>

          <div className="charm-quick-toggles">
            <button
              className={`toggle-action-btn ${windEnabled ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setWindEnabled(!windEnabled);
              }}
              title="Toggle Zero-Gravity Breeze"
            >
              <Wind size={13} />
              <span>{windEnabled ? 'Wind: ON' : 'Wind: OFF'}</span>
            </button>

            <button
              className="toggle-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onPlayChime) onPlayChime(activeDangle.chimeFreq);
              }}
              title="Play Sacred Chime Bell"
            >
              <Volume2 size={13} />
              <span>{t.soundPreview}</span>
            </button>

            {activeDangle.id === 'nimbu' && (
              <button
                className="toggle-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDecayFresh(true);
                  if (onPlayChime) onPlayChime(1046.5);
                  alert('🍋 Hung fresh Nimbu Mirchi! Decay timer reset.');
                }}
                title="Hang Fresh Nimbu"
              >
                <RotateCcw size={13} />
                <span>Fresh Nimbu</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
