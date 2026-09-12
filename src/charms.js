// Charm registry defining physics, dimensions, knot offsets, and ritual shaders

// Dynamic Zero-Gravity Wind Flutter & Cursor Reluctance Physics Engine for Trailing Strings
function drawZeroGravityStrings(ctx, charm, stringsState, stringConfigs, mousePos) {
  if (!stringsState || !stringConfigs) return;

  const charmAngVel = charm.angularVelocity || 0;
  const charmVelX = charm.velocity ? charm.velocity.x : 0;
  const targetLag = -charmAngVel * 7.5 - charmVelX * 0.038;
  const stringBowTarget = -charmVelX * 1.6 - charmAngVel * 38;

  // Atmospheric multi-harmonic continuous breeze
  const t = performance.now() * 0.0032;
  const charmAngle = charm.angle || 0;
  const cosA = Math.cos(charmAngle);
  const sinA = Math.sin(charmAngle);

  stringConfigs.forEach((cfg, idx) => {
    const s = stringsState[idx];
    if (!s) return;

    // Harmonic wind waves (never perfectly rigid or still; perpetually buoyant)
    const windHarmonic1 = Math.sin(t * 1.7 + idx * 1.4) * 0.22;
    const windHarmonic2 = Math.cos(t * 3.1 + idx * 2.2) * 0.12;
    const windLift = Math.sin(t * 2.0 + idx * 1.6) * 0.18 + 0.12; // Gently lifts strings against gravity

    const baseTarget = cfg.restAngle + targetLag + windHarmonic1 + windHarmonic2;
    const springForce = (baseTarget - s.angle) * (cfg.stiffness || 0.11);
    s.vel = (s.vel + springForce) * (cfg.damping || 0.86);
    s.angle += s.vel;

    s.bowX += (stringBowTarget - s.bowX) * 0.15;

    // Active Mouse Pointer Reluctance on string tips
    let mouseEvadeX = 0;
    let mouseEvadeY = 0;
    if (mousePos && mousePos.active && !mousePos.isMouseDown) {
      // String root in screen coordinates
      const rootScreenX = charm.position.x + cosA * cfg.attachX - sinA * cfg.attachY;
      const rootScreenY = charm.position.y + sinA * cfg.attachX + cosA * cfg.attachY;

      const mDist = Math.hypot(mousePos.x - rootScreenX, mousePos.y - rootScreenY);
      if (mDist < 110 && mDist > 0) {
        const evadeFactor = Math.pow(1 - mDist / 110, 1.4) * 0.75;
        // Direction away from mouse
        const mdx = (rootScreenX - mousePos.x) / mDist;
        const mdy = (rootScreenY - mousePos.y) / mDist;

        // Convert world evasion delta into charm local space
        mouseEvadeX = (mdx * cosA + mdy * sinA) * evadeFactor * 32;
        mouseEvadeY = (-mdx * sinA + mdy * cosA) * evadeFactor * 22;
        s.angle += (mdx * cosA) * evadeFactor * 0.35;
      }
    }

    const startPt = { x: cfg.attachX, y: cfg.attachY };

    // Zero-gravity loft: strings don't drop straight down; they flare and curve in the air
    const effectiveDrop = cfg.dropLen * Math.max(0.45, 1.0 - windLift * 0.45);
    const endPt = {
      x: cfg.attachX + Math.sin(s.angle) * cfg.dropLen + mouseEvadeX,
      y: cfg.attachY + Math.cos(s.angle) * effectiveDrop + mouseEvadeY
    };

    // Cubic Bezier dual control points for organic S-wave ribbon fluttering
    const ctrl1 = {
      x: cfg.attachX + Math.sin(s.angle * 0.4) * (cfg.dropLen * 0.38) + s.bowX * 0.25,
      y: cfg.attachY + cfg.dropLen * 0.35
    };
    const ctrl2 = {
      x: (startPt.x + endPt.x) / 2 + s.bowX * 0.45 + Math.sin(t * 2.8 + idx) * 4.0,
      y: (startPt.y + endPt.y) / 2 + 1.2
    };

    ctx.save();
    // Ambient shadow
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, endPt.x, endPt.y);
    ctx.strokeStyle = cfg.shadowColor || 'rgba(15, 15, 20, 0.25)';
    ctx.lineWidth = (cfg.width || 2.5) * 1.0;
    ctx.shadowColor = cfg.shadowColor || 'rgba(15, 15, 20, 0.25)';
    ctx.shadowBlur = 3.5;
    ctx.shadowOffsetY = 2.2;
    ctx.stroke();

    // Base cord
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, endPt.x, endPt.y);
    ctx.strokeStyle = cfg.base || '#b08233';
    ctx.lineWidth = cfg.width || 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Silk sheen twist highlight
    if (cfg.highlight) {
      ctx.strokeStyle = cfg.highlight;
      ctx.lineWidth = 1.0;
      ctx.setLineDash(cfg.dash || [3, 3]);
      ctx.stroke();
    }

    // Tip accent bead / tassel cap
    if (cfg.tipColor) {
      ctx.beginPath();
      ctx.arc(endPt.x, endPt.y, cfg.tipRadius || 1.8, 0, Math.PI * 2);
      ctx.fillStyle = cfg.tipColor;
      ctx.fill();
    }
    ctx.restore();
  });
}


const CHARMS = {
  nimbu: {
    id: 'nimbu',
    name: 'Nimbu Mirchi',
    culture: 'Indian',
    radius: 44,
    initialY: 200,
    density: 0.016,
    restitution: 0.45,
    // Connect cord snugly at the top chilli stalk
    knotOffset: -56,
    drawW: 90,
    drawH: 110,
    yOffset: 0,
    lemonUri: typeof LEMON_DATA_URI !== 'undefined' ? LEMON_DATA_URI : 'lemon_opt.png',
    chilliUri: typeof CHILLI_DATA_URI !== 'undefined' ? CHILLI_DATA_URI : 'chilli_opt.png',
    dataUri: typeof CHARM_DATA_URI !== 'undefined' ? CHARM_DATA_URI : 'charm.png',
    cord: {
      width: 3.2,
      baseColor: '#b08233',
      highlightColor: '#e2be68',
      shadowColor: 'rgba(40, 25, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#8f6522',
      knotHighlightColor: '#dfba6c',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 170,         // Standard alert zone (matches Drishti)
      maxForce: 0.38,             // Standard crisp dodge force (matches Drishti)
      angularTorque: 0.07,        // Standard reactive tilt (matches Drishti)
      catchSpeedThreshold: 7.0    // Standard swipe threshold (matches Daruma)
    },
    // Dynamic trailing free-fall strings simulation state
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 }, // Left jute thread
      { angle: 0, vel: 0, bowX: 0 }  // Right jute thread
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // Nimbu Decay calculation: 7-day half life
      const hungTime = state.nimbuHungTime || Date.now();
      const elapsedDays = (Date.now() - hungTime) / (1000 * 60 * 60 * 24);
      const decay = Math.min(1.0, Math.max(0.0, elapsedDays / 7.0)); // 0.0 = fresh, 1.0 = brown

      const lemonImg = extraAssets?.lemon;
      const chilliImg = extraAssets?.chilli;

      ctx.save();
      if (decay > 0.05) {
        // Organic browning / desaturation aging filter
        ctx.filter = `sepia(${decay * 0.75}) saturate(${1 - decay * 0.6}) brightness(${1 - decay * 0.25})`;
      }

      // If new high-res lemon & chilli are ready, render authentic tightly-decked talisman
      if (lemonImg && lemonImg.complete && chilliImg && chilliImg.complete) {
        // 1. Draw vertical jute thread spine BEHIND the chillies & lemon
        ctx.save();
        ctx.strokeStyle = '#b08233';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(0, 52);
        ctx.stroke();

        ctx.strokeStyle = '#e2be68';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(0, 52);
        ctx.stroke();
        ctx.restore();

        // 2. 3 TIGHTLY DECKED CHILLIES: proportioned to taper into the plump lemon
        const decks = [
          { y: -46, w: 62, rot: -0.08, flip: false }, // Tier 1 (top): slender
          { y: -28, w: 65, rot: 0.06, flip: true }, // Tier 2 (middle): slightly wider
          { y: -10, w: 63, rot: -0.04, flip: false }  // Tier 3 (bottom): right above lemon
        ];

        // Soft drop shadow for chillies and lemon
        ctx.shadowColor = 'rgba(20, 15, 5, 0.38)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1.5;
        ctx.shadowOffsetY = 3.5;

        // Draw the 3 decked chillies over the spine
        decks.forEach(deck => {
          ctx.save();
          ctx.translate(0, deck.y);
          ctx.rotate(deck.rot);
          if (deck.flip) {
            ctx.scale(-1, 1);
          }
          const h = (deck.w * 163) / 450;
          ctx.drawImage(chilliImg, -deck.w / 2, -h / 2, deck.w, h);
          ctx.restore();

          // Organic puncture entry/exit knot hole where jute passes through
          ctx.save();
          ctx.shadowColor = 'transparent';
          ctx.beginPath();
          ctx.ellipse(0, deck.y, 2.2, 1.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#3e2723';
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, deck.y - 0.5, 1.2, 0.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#8f6522';
          ctx.fill();
          ctx.restore();
        });

        // 3. Draw Plump, well-proportioned Lemon at the base (52x51px)
        ctx.save();
        const lemonW = 52;
        const lemonH = (lemonW * 393) / 400; // ~51px
        const lemonY = 18;
        ctx.drawImage(lemonImg, -lemonW / 2, lemonY - lemonH / 2, lemonW, lemonH);

        // Piercing puncture dot on top and bottom of lemon
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.ellipse(0, lemonY - lemonH / 2 + 3, 2.4, 1.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#4e342e';
        ctx.fill();
        ctx.restore();

        // 4. Authentic Black Charcoal / Vibhuti pebble bead beneath the lemon
        ctx.save();
        ctx.shadowColor = 'rgba(10, 10, 10, 0.35)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.ellipse(0, 44, 6, 5.2, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#222222';
        ctx.fill();
        // Specular charcoal rough texture sheen
        ctx.beginPath();
        ctx.ellipse(-1.5, 42.5, 2.2, 1.6, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#444444';
        ctx.fill();
        ctx.restore();

        // 5. Rustic tied coarse jute knot underneath charcoal bead
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 52, 3.8, 0, Math.PI * 2);
        ctx.fillStyle = '#8f6522';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 51.5, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#dfba6c';
        ctx.fill();
        ctx.restore();

        // 6. Free-Falling Secondary Physics Strings (Twin rustic jute thread ends with zero-gravity flutter)
        const stringConfigs = [
          { attachX: -2.5, attachY: 53, dropLen: 38, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 3], tipColor: '#8f6522', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(20, 15, 5, 0.25)' }, // Left string
          { attachX: 2.5, attachY: 53, dropLen: 44, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 3], tipColor: '#8f6522', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(20, 15, 5, 0.25)' }  // Right string
        ];

        drawZeroGravityStrings(ctx, charm, CHARMS.nimbu.stringsState, stringConfigs, mousePos || extraAssets?.mousePos || state?.mousePos);

      } else if (img && img.complete && img.naturalWidth > 0) {
        // Fallback to legacy single asset while images load
        ctx.drawImage(img, -CHARMS.nimbu.drawW / 2, -CHARMS.nimbu.drawH / 2 + CHARMS.nimbu.yOffset, CHARMS.nimbu.drawW, CHARMS.nimbu.drawH);
      }

      ctx.restore();
    }
  },

  drishti: {
    id: 'drishti',
    name: 'Drishti Bommai',
    culture: 'South Indian',
    radius: 54,
    initialY: 195,
    density: 0.016,
    restitution: 0.40,
    // Connect at the top of the beads
    knotOffset: -88,
    drawW: 130,
    drawH: 130, // 1080x1080 square mask
    yOffset: 4,
    dataUri: typeof DRISHTI_DATA_URI !== 'undefined' ? DRISHTI_DATA_URI : 'drishti.png',
    beadsUri: typeof BEADS_DATA_URI !== 'undefined' ? BEADS_DATA_URI : 'beads.png',
    reluctance: {
      enabled: true,
      triggerRadius: 170,         // Alert zone
      maxForce: 0.38,             // Crisp, commanding warding dodge
      angularTorque: 0.07,        // Protective tilt
      catchSpeedThreshold: 7.2    // Swipe threshold
    },
    // Dynamic trailing free-fall strings simulation state
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 }, // Left silk thread
      { angle: 0, vel: 0, bowX: 0 }, // Center silk thread
      { angle: 0, vel: 0, bowX: 0 }  // Right silk thread
    ],
    cord: {
      width: 3.2,
      baseColor: '#bfa036',
      highlightColor: '#ffec94',
      shadowColor: 'rgba(60, 42, 10, 0.50)',
      hasKnotDot: false,
      dash: [5, 2]
    },
    renderCustom: (ctx, charm, img, state, extraAssets) => {
      const palette = state.drishtiPalette || 'crimson';

      // 1. Draw beads above the mask crown on the thread
      const beadsImg = extraAssets?.beads;
      if (beadsImg && beadsImg.complete && beadsImg.naturalWidth > 0) {
        ctx.save();
        const beadW = 23;
        const beadH = (beadW * 160) / 92; // ~40px tall
        // Position beads right above the mask crown (crown top is around y = -50)
        // Bottom of beads touches y = -48, top of beads reaches y = -88 (matches knotOffset)
        const beadBottomY = -48;
        const beadY = beadBottomY - beadH;

        // Soft drop shadow for 3D realism
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1.5;
        ctx.shadowOffsetY = 3.5;

        ctx.drawImage(beadsImg, -beadW / 2, beadY, beadW, beadH);
        ctx.restore();
      }

      // 2. Connecting Thread Segment passing beneath chin
      ctx.save();
      ctx.strokeStyle = '#bd1f2d';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, 68);
      ctx.stroke();

      ctx.strokeStyle = '#e5a93c';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, 68);
      ctx.stroke();
      ctx.restore();

      // 3. Draw mask with selected finish
      ctx.save();
      if (palette === 'terracotta') {
        ctx.filter = 'hue-rotate(25deg) saturate(1.2)';
      } else if (palette === 'gold') {
        ctx.filter = 'hue-rotate(65deg) saturate(1.4) brightness(1.1)';
      } else if (palette === 'black') {
        ctx.filter = 'grayscale(0.9) contrast(1.3) brightness(0.65)';
      }
      ctx.drawImage(img, -CHARMS.drishti.drawW / 2, -CHARMS.drishti.drawH / 2 + CHARMS.drishti.yOffset, CHARMS.drishti.drawW, CHARMS.drishti.drawH);
      ctx.restore();

      // 4. Sacred Rudraksha seed bead suspended beneath the chin
      ctx.save();
      ctx.shadowColor = 'rgba(25, 15, 5, 0.40)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2.5;

      const beadCenterY = 56;
      ctx.beginPath();
      ctx.arc(0, beadCenterY, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = '#6a2a0c'; // Deep rudraksha reddish-brown
      ctx.fill();

      // Rudraksha furrow ridges (mukhi facets)
      ctx.strokeStyle = '#431906';
      ctx.lineWidth = 1.4;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        ctx.beginPath();
        ctx.moveTo(0, beadCenterY);
        ctx.lineTo(Math.cos(angle) * 8.5, beadCenterY + Math.sin(angle) * 8.5);
        ctx.stroke();
      }

      // Specular ridge highlight
      ctx.beginPath();
      ctx.arc(-2.5, beadCenterY - 2.5, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#9b471a';
      ctx.fill();
      ctx.restore();

      // 5. Ceremonial Raksha Knot (Mauli thread wrap with gold tie)
      ctx.save();
      ctx.shadowColor = 'rgba(20, 5, 5, 0.40)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.arc(0, 68, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#bd1f2d'; // Crimson sacred tie
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 67.5, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#e5a93c'; // Gold ceremonial thread wrap
      ctx.fill();
      ctx.restore();

      // 6. Free-Falling Secondary Physics Strings (3 Ceremonial Red & Saffron Silk Threads with zero-gravity flutter)
      const stringConfigs = [
        { attachX: -3.0, attachY: 70, dropLen: 42, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#bd1f2d', highlight: '#ff7675', dash: [3, 3], tipColor: '#e5a93c', tipRadius: 1.8, width: 2.6, shadowColor: 'rgba(20, 5, 5, 0.28)' }, // Crimson
        { attachX: 0.0, attachY: 71, dropLen: 50, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#d35400', highlight: '#f39c12', dash: [3, 3], tipColor: '#e5a93c', tipRadius: 1.8, width: 2.6, shadowColor: 'rgba(20, 5, 5, 0.28)' }, // Saffron
        { attachX: 3.0, attachY: 70, dropLen: 44, stiffness: 0.12, damping: 0.86, restAngle: 0.06, base: '#bd1f2d', highlight: '#f1c40f', dash: [3, 3], tipColor: '#e5a93c', tipRadius: 1.8, width: 2.6, shadowColor: 'rgba(20, 5, 5, 0.28)' }  // Gold/Red
      ];

      drawZeroGravityStrings(ctx, charm, CHARMS.drishti.stringsState, stringConfigs, extraAssets?.mousePos || state?.mousePos);
    }
  },

  drishti_old: {
    id: 'drishti_old',
    name: 'Drishti Bommai (Old)',
    culture: 'Traditional South Indian',
    radius: 54,
    initialY: 195,
    density: 0.017,
    restitution: 0.38,
    // Connect cord snugly at the top crown knot loop
    knotOffset: -56,
    drawW: 124,
    drawH: 127, // Proportional to 929x953
    yOffset: 4,
    dataUri: typeof DRISHTI_OLD_DATA_URI !== 'undefined' ? DRISHTI_OLD_DATA_URI : 'drishti_old_opt.png',
    reluctance: {
      enabled: true,
      triggerRadius: 175,         // Revered presence
      maxForce: 0.42,             // Noticeable, decisive warding evasion
      angularTorque: 0.08,        // Ritual tilt
      catchSpeedThreshold: 7.5    // Requires quick flick
    },
    // Authentic thick black ritual cotton/wool protective thread (Karu-kayiru)
    cord: {
      width: 5.5,                               // Thick rope/thread
      baseColor: '#121212',                     // Deep matte carbon black
      highlightColor: '#4a4a4a',                // Braided fiber sheen
      highlightWidth: 1.6,                      // Pronounced twist
      shadowColor: 'rgba(0, 0, 0, 0.65)',       // Strong ambient occlusion shadow
      hasKnotDot: true,                         // Tied ritual knot at attachment loop
      knotBaseColor: '#0a0a0a',                 // Jet black knot
      knotHighlightColor: '#3c3c3c',            // Subtle knot specular edge
      dash: [5, 4]
    },
    renderCustom: (ctx, charm, img, state) => {
      const palette = state.drishtiPalette || 'crimson';

      // 1. Draw ritual knot loop right at attachment point on top of mask crown
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -56, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0f0f';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.restore();

      // 2. Draw authentic vintage Drishti Bommai mask with custom finishes
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        if (palette === 'terracotta') {
          ctx.filter = 'hue-rotate(25deg) saturate(1.2)';
        } else if (palette === 'gold') {
          ctx.filter = 'hue-rotate(65deg) saturate(1.4) brightness(1.1)';
        } else if (palette === 'black') {
          ctx.filter = 'grayscale(0.9) contrast(1.3) brightness(0.65)';
        }

        // Realistic drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2.0;
        ctx.shadowOffsetY = 4.0;

        ctx.drawImage(
          img,
          -CHARMS.drishti_old.drawW / 2,
          -CHARMS.drishti_old.drawH / 2 + CHARMS.drishti_old.yOffset,
          CHARMS.drishti_old.drawW,
          CHARMS.drishti_old.drawH
        );
        ctx.restore();
      }
    }
  },

  daruma: {
    id: 'daruma',
    name: 'Daruma Doll',
    culture: 'Japanese',
    radius: 50,
    initialY: 190,
    density: 0.015,
    restitution: 0.50,
    knotOffset: -50,
    drawW: 104,
    drawH: 109, // Proportional to 888x929
    yOffset: 6,
    dataUri: typeof DARUMA_DATA_URI !== 'undefined' ? DARUMA_DATA_URI : 'daruma.png',
    cord: {
      width: 3.2,
      baseColor: '#bd1f2d',
      highlightColor: '#ff6b6b',
      shadowColor: 'rgba(60, 10, 15, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#9b111e',
      knotHighlightColor: '#ff8585',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 165,         // Personal zone
      maxForce: 0.36,             // Springy rolling dodge
      angularTorque: 0.08,        // Wobble tumescent tilt
      catchSpeedThreshold: 7.0    // Ambush threshold
    },
    // Dynamic trailing free-fall strings simulation state
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 }, // Left silk tassel
      { angle: 0, vel: 0, bowX: 0 }  // Right silk tassel
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // 1. Top Lacquered Mizuhiki Wooden Bead at attachment point
      ctx.save();
      ctx.shadowColor = 'rgba(40, 10, 10, 0.40)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      // Outer crimson sphere
      ctx.beginPath();
      ctx.arc(0, -50, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#9b111e';
      ctx.fill();

      // Gold Mizuhiki waist band
      ctx.beginPath();
      ctx.arc(0, -50, 5.5, -0.3, 0.3);
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Specular shine
      ctx.beginPath();
      ctx.arc(-1.8, -51.8, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff8585';
      ctx.fill();
      ctx.restore();

      // 2. Connecting Crimson Silk Thread through base
      ctx.save();
      ctx.strokeStyle = '#bd1f2d';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, 66);
      ctx.stroke();

      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, 66);
      ctx.stroke();
      ctx.restore();

      // 3. Draw base Daruma doll
      ctx.drawImage(img, -CHARMS.daruma.drawW / 2, -CHARMS.daruma.drawH / 2 + CHARMS.daruma.yOffset, CHARMS.daruma.drawW, CHARMS.daruma.drawH);

      const eyeState = state.darumaState || 0; // 0 = blank, 1 = left eye, 2 = both eyes

      // Eye coordinates relative to doll center
      const leftEyeX = -15;
      const leftEyeY = 0;
      const rightEyeX = 15;
      const rightEyeY = 0;
      const pupilR = 6;

      ctx.fillStyle = '#111111';

      if (eyeState >= 1) {
        // Left eye painted (Wish Made)
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, pupilR, 0, Math.PI * 2);
        ctx.fill();
        // Specular eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(leftEyeX - 1.8, leftEyeY - 1.8, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
      }

      if (eyeState >= 2) {
        // Right eye painted (Wish Fulfilled!)
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, pupilR, 0, Math.PI * 2);
        ctx.fill();
        // Specular eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rightEyeX - 1.8, rightEyeY - 1.8, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Carved Cherrywood / Hinoki Wishing Bead suspended beneath doll base
      ctx.save();
      ctx.shadowColor = 'rgba(30, 10, 5, 0.40)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2.5;

      const beadY = 56;
      ctx.beginPath();
      ctx.arc(0, beadY, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#d35400'; // Rich warm cherrywood
      ctx.fill();

      // Woodgrain fine rings
      ctx.strokeStyle = '#a04000';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, beadY, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Lacquer sheen
      ctx.beginPath();
      ctx.arc(-2.2, beadY - 2.2, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#f39c12';
      ctx.fill();
      ctx.restore();

      // 5. Traditional Japanese Ceremonial Knot (Mizuhiki bow/clover knot)
      ctx.save();
      ctx.shadowColor = 'rgba(25, 5, 5, 0.40)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.arc(0, 66, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#9b111e'; // Deep crimson knot
      ctx.fill();

      // Gold ornamental thread tie
      ctx.beginPath();
      ctx.arc(0, 65.5, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fill();
      ctx.restore();

      // 6. Free-Falling Secondary Physics Strings (Dual Flowing Crimson Silk Tassel Cords with zero-gravity flutter)
      const stringConfigs = [
        { attachX: -2.8, attachY: 68, dropLen: 36, stiffness: 0.13, damping: 0.85, restAngle: -0.06, base: '#bd1f2d', highlight: '#ff7675', dash: [3, 3], tipColor: '#f1c40f', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(25, 5, 5, 0.28)' }, // Left tassel
        { attachX: 2.8, attachY: 68, dropLen: 44, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#bd1f2d', highlight: '#ff7675', dash: [3, 3], tipColor: '#f1c40f', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(25, 5, 5, 0.28)' }  // Right tassel
      ];

      drawZeroGravityStrings(ctx, charm, CHARMS.daruma.stringsState, stringConfigs, mousePos || extraAssets?.mousePos || state?.mousePos);
    }
  },

  nazar: {
    id: 'nazar',
    name: 'Nazar Boncuğu (Evil Eye)',
    culture: 'Turkish & Mediterranean',
    radius: 36,
    initialY: 195,
    density: 0.016,
    restitution: 0.45,
    // Connect cord snugly at the top bead knot loop
    knotOffset: -54,
    drawW: 66,
    drawH: 68,
    yOffset: 0,
    dataUri: typeof NAZAR_DATA_URI !== 'undefined' ? NAZAR_DATA_URI : 'nazar_opt.png',
    beadsUri: typeof NAZAR_BEADS_DATA_URI !== 'undefined' ? NAZAR_BEADS_DATA_URI : 'beads_nazar_opt.png',
    cord: {
      width: 3.2,
      baseColor: '#1d3557',
      highlightColor: '#64b5f6',
      shadowColor: 'rgba(10, 20, 50, 0.40)',
      hasKnotDot: false,
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 165,         // Sensitive awareness
      maxForce: 0.33,             // Delicate glass disc dodge
      angularTorque: 0.05,        // Shimmering tilt
      catchSpeedThreshold: 6.8    // Catch threshold
    },
    // Dynamic trailing free-fall strings simulation state
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 }, // Left string
      { angle: 0, vel: 0, bowX: 0 }, // Center string
      { angle: 0, vel: 0, bowX: 0 }  // Right string
    ],
    renderCustom: (ctx, charm, img, state, extraAssets) => {
      const beadImg = extraAssets?.beads;

      // Soft ambient shadow for bead elements
      const applyBeadShadow = () => {
        ctx.shadowColor = 'rgba(10, 15, 40, 0.35)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1.2;
        ctx.shadowOffsetY = 2.5;
      };

      // 1. Thread segment passing through top bead into the glass disc eyelet
      ctx.save();
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -54);
      ctx.lineTo(0, -28);
      ctx.stroke();

      // Twisted silk highlight on top connecting cord
      ctx.strokeStyle = '#64b5f6';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, -54);
      ctx.lineTo(0, -28);
      ctx.stroke();
      ctx.restore();

      // 2. Top Single Glass Evil Eye Cube Bead (sits directly above eyelet)
      if (beadImg && beadImg.complete && beadImg.naturalWidth > 0) {
        ctx.save();
        applyBeadShadow();
        const topBeadY = -41;
        const topSize = 19;
        ctx.translate(0, topBeadY);
        ctx.rotate(0.06); // Subtle artisanal tilt
        ctx.drawImage(beadImg, -topSize / 2, -topSize / 2, topSize, topSize);
        ctx.restore();
      }

      // 3. Central Glass Evil Eye Disc Badge
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        const w = 64; // Well-proportioned talisman disc
        const h = (w * 703) / 680; // ~66px
        const discY = 4; // Center of disc

        ctx.shadowColor = 'rgba(10, 20, 50, 0.40)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4.5;

        ctx.drawImage(img, -w / 2, discY - h / 2, w, h);
        ctx.restore();
      }

      // 4. Connecting Thread Segment below the Disc into Bottom Bead & Knot
      ctx.save();
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(0, 60);
      ctx.stroke();

      ctx.strokeStyle = '#64b5f6';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(0, 60);
      ctx.stroke();
      ctx.restore();

      // 5. Bottom Single Glass Evil Eye Cube Bead (suspended directly beneath disc)
      if (beadImg && beadImg.complete && beadImg.naturalWidth > 0) {
        ctx.save();
        applyBeadShadow();
        const bottomBeadY = 48;
        const bottomSize = 18;
        ctx.translate(0, bottomBeadY);
        ctx.rotate(-0.05); // Organic handcrafted tilt
        ctx.drawImage(beadImg, -bottomSize / 2, -bottomSize / 2, bottomSize, bottomSize);
        ctx.restore();
      }

      // 6. Artisanal Wound Macramé / Jute Knot (underneath bottom bead)
      ctx.save();
      ctx.shadowColor = 'rgba(10, 15, 30, 0.40)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
      // Outer knot wrap
      ctx.beginPath();
      ctx.arc(0, 60, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#14253d';
      ctx.fill();
      // Highlight core
      ctx.beginPath();
      ctx.arc(0, 59.5, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#3a6ea5';
      ctx.fill();
      ctx.restore();

      // 7. Free-Falling Secondary Physics Strings (Tassel / Fringe with zero-gravity flutter)
      const stringConfigs = [
        { attachX: -3.5, attachY: 62, dropLen: 38, stiffness: 0.12, damping: 0.86, restAngle: -0.07, base: '#1d3557', highlight: '#64b5f6', dash: [3, 3], tipColor: '#3a6ea5', tipRadius: 1.8, width: 2.6, shadowColor: 'rgba(10, 15, 35, 0.30)' }, // Left string
        { attachX: 0.0, attachY: 63, dropLen: 46, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#1d3557', highlight: '#64b5f6', dash: [3, 3], tipColor: '#3a6ea5', tipRadius: 1.8, width: 2.6, shadowColor: 'rgba(10, 15, 35, 0.30)' }, // Center string
        { attachX: 3.5, attachY: 62, dropLen: 39, stiffness: 0.12, damping: 0.86, restAngle: 0.07, base: '#1d3557', highlight: '#64b5f6', dash: [3, 3], tipColor: '#3a6ea5', tipRadius: 1.8, width: 2.6, shadowColor: 'rgba(10, 15, 35, 0.30)' }  // Right string
      ];

      drawZeroGravityStrings(ctx, charm, CHARMS.nazar.stringsState, stringConfigs, extraAssets?.mousePos || state?.mousePos);
    }
  },

  dreamcatcher: {
    id: 'dreamcatcher',
    name: 'Dreamcatcher',
    culture: 'Native American',
    radius: 44,
    initialY: 195,
    density: 0.015,
    restitution: 0.45,
    // Connect cord at top of the sandalwood/turquoise beads
    knotOffset: -92,
    drawW: 92,
    drawH: 97,
    yOffset: 0,
    hoopUri: typeof DREAMCATCHER_HOOP_URI !== 'undefined' ? DREAMCATCHER_HOOP_URI : 'dreamcatcher_hoop_opt.png',
    featherUri: typeof DREAMCATCHER_FEATHER_URI !== 'undefined' ? DREAMCATCHER_FEATHER_URI : 'dreamcatcher_feather_opt.png',
    beadsUri: typeof DREAMCATCHER_BEADS_URI !== 'undefined' ? DREAMCATCHER_BEADS_URI : 'dreamcatcher_beads_opt.png',
    dataUri: typeof DREAMCATCHER_HOOP_URI !== 'undefined' ? DREAMCATCHER_HOOP_URI : 'dreamcatcher_hoop_opt.png',
    cord: {
      width: 3.2,
      baseColor: '#5d4037',
      highlightColor: '#a1887f',
      shadowColor: 'rgba(30, 20, 15, 0.40)',
      hasKnotDot: false,
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 170,         // Gentle aura
      maxForce: 0.32,             // Light, airy floating recoil
      angularTorque: 0.05,        // Feather-fluttering tilt
      catchSpeedThreshold: 6.8    // Catch threshold
    },
    // Dynamic trailing feather angle and displacement state
    feathersState: [
      { angle: 0, vel: 0, bowX: 0 }, // Left
      { angle: 0, vel: 0, bowX: 0 }, // Center
      { angle: 0, vel: 0, bowX: 0 }  // Right
    ],
    renderCustom: (ctx, charm, img, state, extraAssets) => {
      const hoopImg = extraAssets?.hoop || img;
      const featherImg = extraAssets?.feather;
      const beadsImg = extraAssets?.beads;

      // 1. Draw Strung Beads along the top suspension cord
      if (beadsImg && beadsImg.complete && beadsImg.naturalWidth > 0) {
        ctx.save();
        const beadW = 16;
        const beadH = (beadW * 200) / 36; // ~88px tall
        const beadBottomY = -42; // Sits at the top hoop knot
        const beadY = beadBottomY - beadH;

        ctx.shadowColor = 'rgba(20, 15, 10, 0.35)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1.2;
        ctx.shadowOffsetY = 2.5;

        ctx.drawImage(beadsImg, -beadW / 2, beadY, beadW, beadH);
        ctx.restore();
      }

      // 2. Draw Sacred Willow Hoop & Woven Web (Center at y = 0)
      if (hoopImg && hoopImg.complete && hoopImg.naturalWidth > 0) {
        ctx.save();
        const hoopW = 88;
        const hoopH = (hoopW * 400) / 379; // ~93px

        ctx.shadowColor = 'rgba(20, 15, 10, 0.38)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1.8;
        ctx.shadowOffsetY = 4.0;

        ctx.drawImage(hoopImg, -hoopW / 2, -hoopH / 2, hoopW, hoopH);
        ctx.restore();
      }

      // 3. Independent Pliable 3.2px Hanging Strings & Secondary Trailing Feathers
      if (featherImg && featherImg.complete && featherImg.naturalWidth > 0) {
        const fState = CHARMS.dreamcatcher.feathersState;

        // Dynamic sway and horizontal bowing driven by charm movement
        const charmAngVel = charm.angularVelocity || 0;
        const charmVelX = charm.velocity ? charm.velocity.x : 0;
        const targetLag = -charmAngVel * 7.5 - charmVelX * 0.038;
        const stringBowTarget = -charmVelX * 1.8 - charmAngVel * 45;

        // Configuration for 3 distinct hanging strings and feathers
        const configs = [
          { attachX: -24, attachY: 36, dropLen: 26, w: 22, h: (22 * 300) / 148, stiffness: 0.12, damping: 0.86, restAngle: -0.06 },
          { attachX: 0, attachY: 42, dropLen: 38, w: 26, h: (26 * 300) / 148, stiffness: 0.09, damping: 0.88, restAngle: 0 },
          { attachX: 24, attachY: 36, dropLen: 26, w: 22, h: (22 * 300) / 148, stiffness: 0.12, damping: 0.86, restAngle: 0.06 }
        ];

        configs.forEach((cfg, idx) => {
          const s = fState[idx];
          // Spring force towards restAngle + dynamic lag
          const target = cfg.restAngle + targetLag;
          const force = (target - s.angle) * cfg.stiffness;
          s.vel = (s.vel + force) * cfg.damping;
          s.angle += s.vel;

          // String lateral bow
          s.bowX += (stringBowTarget - s.bowX) * 0.14;

          const startPt = { x: cfg.attachX, y: cfg.attachY };
          // Calculate bottom end of the string (where feather quill connects)
          const endPt = {
            x: cfg.attachX + Math.sin(s.angle) * cfg.dropLen,
            y: cfg.attachY + Math.cos(s.angle) * cfg.dropLen
          };
          // Mid-curve control point: pliable string catenary bow under motion and gravity
          const ctrlPt = {
            x: (startPt.x + endPt.x) / 2 + s.bowX * 0.4,
            y: (startPt.y + endPt.y) / 2 + 2.5
          };

          // A. Draw Dynamic Curving Leather Hanging String (Uniform 3.2px width)
          ctx.save();
          // Shadow pass
          ctx.beginPath();
          ctx.moveTo(startPt.x, startPt.y);
          ctx.quadraticCurveTo(ctrlPt.x, ctrlPt.y, endPt.x, endPt.y);
          ctx.strokeStyle = 'rgba(30, 20, 15, 0.35)';
          ctx.lineWidth = 2.8;
          ctx.shadowColor = 'rgba(20, 15, 10, 0.35)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1.2;
          ctx.shadowOffsetY = 2.2;
          ctx.stroke();

          // Base 3.2px rawhide string
          ctx.beginPath();
          ctx.moveTo(startPt.x, startPt.y);
          ctx.quadraticCurveTo(ctrlPt.x, ctrlPt.y, endPt.x, endPt.y);
          ctx.strokeStyle = '#5d4037';
          ctx.lineWidth = 3.2; // Uniform standard thickness
          ctx.lineCap = 'round';
          ctx.stroke();

          // Highlight thread
          ctx.strokeStyle = '#a1887f';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.restore();

          // B. Top rim knot bead & intermediate mid-string bead
          ctx.save();
          // Rim knot bead
          ctx.beginPath();
          ctx.arc(startPt.x, startPt.y, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = '#4e342e';
          ctx.fill();

          // Mid-string turquoise bead
          ctx.beginPath();
          ctx.arc(ctrlPt.x, ctrlPt.y, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#26a69a';
          ctx.fill();
          ctx.restore();

          // C. Draw Trailing Feather hanging from the string end
          ctx.save();
          ctx.translate(endPt.x, endPt.y);
          ctx.rotate(s.angle);

          // Feather drop shadow
          ctx.shadowColor = 'rgba(15, 10, 5, 0.32)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1.0;
          ctx.shadowOffsetY = 2.5;

          // Draw feather with leather loop at (0, 0)
          ctx.drawImage(featherImg, -cfg.w / 2, 0, cfg.w, cfg.h);
          ctx.restore();
        });
      }
    }
  },

  hamsa: {
    id: 'hamsa',
    name: 'Hamsa (Hand of Protection)',
    culture: 'Middle Eastern & Mediterranean',
    radius: 46,
    initialY: 195,
    density: 0.016,
    restitution: 0.44,
    // Connect cord at top loop of the hand
    knotOffset: -60,
    drawW: 86,
    drawH: 100, // 517x605 ratio
    yOffset: -2,
    dataUri: typeof HAMSA_DATA_URI !== 'undefined' ? HAMSA_DATA_URI : 'hamsa_opt.png',
    cord: {
      width: 3.2,
      baseColor: '#0f3057',                     // Deep Mediterranean azure
      highlightColor: '#00bcd4',                // Turquoise silk twist
      shadowColor: 'rgba(10, 20, 50, 0.45)',
      hasKnotDot: false,
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 165,         // Sensitive sacred zone
      maxForce: 0.35,             // Graceful sidestep warding
      angularTorque: 0.06,        // Mystical protective tilt
      catchSpeedThreshold: 6.8    // Catch threshold
    },
    // Dynamic trailing free-fall strings simulation state
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 }, // Left string
      { angle: 0, vel: 0, bowX: 0 }, // Center string
      { angle: 0, vel: 0, bowX: 0 }  // Right string
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // 1. Top Single Turquoise / Evil Eye Accent Bead above the hand
      ctx.save();
      ctx.shadowColor = 'rgba(10, 20, 40, 0.35)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      // Connecting thread through top bead
      ctx.strokeStyle = '#0f3057';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(0, -42);
      ctx.stroke();

      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(0, -42);
      ctx.stroke();

      // Top glass bead
      const topBeadY = -50;
      ctx.beginPath();
      ctx.arc(0, topBeadY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00838f'; // Deep rich turquoise
      ctx.fill();

      // Eye highlight within bead
      ctx.beginPath();
      ctx.arc(0, topBeadY, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topBeadY, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = '#0f3057';
      ctx.fill();

      // Specular reflection
      ctx.beginPath();
      ctx.arc(-1.6, topBeadY - 1.6, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#e0f7fa';
      ctx.fill();
      ctx.restore();

      // 2. Main Hamsa Hand Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(10, 25, 50, 0.38)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1.8;
        ctx.shadowOffsetY = 3.8;

        ctx.drawImage(
          img,
          -CHARMS.hamsa.drawW / 2,
          -CHARMS.hamsa.drawH / 2 + CHARMS.hamsa.yOffset,
          CHARMS.hamsa.drawW,
          CHARMS.hamsa.drawH
        );
        ctx.restore();
      }

      // 3. Connecting Thread Segment below the Hamsa Hand into Bottom Bead & Knot
      ctx.save();
      ctx.strokeStyle = '#0f3057';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, 62);
      ctx.stroke();

      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(0, 62);
      ctx.stroke();
      ctx.restore();

      // 4. Bottom Turquoise Seed Bead
      ctx.save();
      ctx.shadowColor = 'rgba(10, 20, 40, 0.35)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      const bottomBeadY = 52;
      ctx.beginPath();
      ctx.arc(0, bottomBeadY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00acc1'; // Vibrant turquoise
      ctx.fill();

      // Filigree silver band
      ctx.beginPath();
      ctx.arc(0, bottomBeadY, 6.5, -0.3, 0.3);
      ctx.strokeStyle = '#b0bec5';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(-1.8, bottomBeadY - 1.8, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 5. Silver / Cobalt Macramé Knot underneath bead
      ctx.save();
      ctx.shadowColor = 'rgba(10, 15, 30, 0.40)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.arc(0, 62, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#0f3057';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 61.5, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#80deea';
      ctx.fill();
      ctx.restore();

      // 6. Free-Falling Secondary Physics Strings (3 Flowing Azure & Turquoise Silk Cords with zero-gravity flutter)
      const stringConfigs = [
        { attachX: -3.2, attachY: 64, dropLen: 38, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#0f3057', highlight: '#00bcd4', dash: [3, 3], tipColor: '#00838f', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(10, 20, 45, 0.28)' }, // Left cord
        { attachX: 0.0, attachY: 65, dropLen: 46, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#00838f', highlight: '#80deea', dash: [3, 3], tipColor: '#00bcd4', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(10, 20, 45, 0.28)' }, // Center cord
        { attachX: 3.2, attachY: 64, dropLen: 40, stiffness: 0.12, damping: 0.86, restAngle: 0.06, base: '#0f3057', highlight: '#00bcd4', dash: [3, 3], tipColor: '#00838f', tipRadius: 1.8, width: 2.5, shadowColor: 'rgba(10, 20, 45, 0.28)' }  // Right cord
      ];

      drawZeroGravityStrings(ctx, charm, CHARMS.hamsa.stringsState, stringConfigs, mousePos || extraAssets?.mousePos || state?.mousePos);
    }
  }
};
