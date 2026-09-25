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
    radius: 54,
    initialY: 195,
    density: 0.016,
    restitution: 0.40,
    knotOffset: -88,
    drawW: 105,
    drawH: 155,
    yOffset: 2,
    dataUri: typeof CHARM_DATA_URI !== 'undefined' ? CHARM_DATA_URI : 'charm.png',
    lemonUri: typeof LEMON_DATA_URI !== 'undefined' ? LEMON_DATA_URI : 'lemon_opt.png',
    chilliUri: typeof CHILLI_DATA_URI !== 'undefined' ? CHILLI_DATA_URI : 'chilli_opt.png',
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
      triggerRadius: 170,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 155;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (105 / 155);
      const targetW = targetH * aspect;
      const topY = -88;

      // 1. Top Sacred Jute Attachment Knot & Loop
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#8f6522';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, topY - 1, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#dfba6c';
      ctx.fill();
      ctx.restore();

      // 2. High-Performance Authentic Talisman Image Render (Single Pass with Soft Ambient Shadow)
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(20, 15, 5, 0.35)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(img, -targetW / 2, topY + 4, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Sacred Jute & Thread End Tassels (Zero-Gravity Flutter)
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -4, attachY: bottomY - 6, dropLen: 42, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 2], tipColor: '#8f6522', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(20, 15, 5, 0.25)' },
        { attachX: 0, attachY: bottomY - 4, dropLen: 48, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#222222', highlight: '#555555', dash: [3, 2], tipColor: '#b08233', tipRadius: 2.2, width: 2.6, shadowColor: 'rgba(10, 10, 10, 0.28)' },
        { attachX: 4, attachY: bottomY - 6, dropLen: 44, stiffness: 0.12, damping: 0.86, restAngle: 0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 2], tipColor: '#8f6522', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(20, 15, 5, 0.25)' }
      ];

      drawZeroGravityStrings(ctx, charm, CHARMS.nimbu.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  vettaiyaadu: {
    id: 'vettaiyaadu',
    name: 'Vettaiyaadu Talisman (வேட்டையாடு விளையாடு)',
    culture: 'Tamil Cinema & Sacred Protection',
    radius: 60,
    initialY: 195,
    density: 0.016,
    restitution: 0.40,
    knotOffset: -105,
    drawW: 130,
    drawH: 215,
    yOffset: 2,
    dataUri: 'vettaiyaadu.png',
    isMultiNode: true,
    nodes: [
      { id: 'padigaram', name: 'Padigaram (Alum Stone)', image: 'padigaram.png', radius: 28, width: 80, height: 60, density: 0.018 },
      { id: 'chilli', name: 'Pachai Milagai (Chillies)', image: 'chilli_opt.png', radius: 24, width: 126, height: 46, density: 0.014 },
      { id: 'elumichai', name: 'Elumichai (Lemon)', image: 'lemon_opt.png', radius: 36, width: 84, height: 84, density: 0.020 },
      { id: 'finger', name: 'The Clue Finger', image: 'finger.png', radius: 26, width: 118, height: 56, density: 0.024 }
    ],
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.42,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
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
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // Fallback renderer if single body is used
      const targetH = 215;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (130 / 215);
      const targetW = targetH * aspect;
      const topY = -105;

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#8f6522';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY - 1, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#dfba6c';
      ctx.fill();
      ctx.restore();

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(20, 15, 5, 0.45)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(img, -targetW / 2, topY + 4, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -4, attachY: bottomY - 6, dropLen: 42, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 2], tipColor: '#8f6522', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(20, 15, 5, 0.25)' },
        { attachX: 0, attachY: bottomY - 4, dropLen: 48, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#222222', highlight: '#555555', dash: [3, 2], tipColor: '#b08233', tipRadius: 2.2, width: 2.6, shadowColor: 'rgba(10, 10, 10, 0.28)' },
        { attachX: 4, attachY: bottomY - 6, dropLen: 44, stiffness: 0.12, damping: 0.86, restAngle: 0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 2], tipColor: '#8f6522', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(20, 15, 5, 0.25)' }
      ];

      drawZeroGravityStrings(ctx, charm, CHARMS.vettaiyaadu.stringsState, stringConfigs, mousePos || state?.mousePos);
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
  },

  murugan_vel_pendant: {
    id: 'murugan_vel_pendant',
    name: 'Golden Gnana Vel (ஞான வேல்)',
    culture: 'Tamil Hindu',
    radius: 40,
    initialY: 200,
    density: 0.019,
    restitution: 0.42,
    knotOffset: -82,
    drawW: 46,
    drawH: 185,
    yOffset: 10,
    dataUri: 'murugan_vel_pendant.png',
    cord: {
      width: 3.2,
      baseColor: '#d48806',
      highlightColor: '#ffd666',
      shadowColor: 'rgba(50, 20, 0, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#ad6800',
      knotHighlightColor: '#ffe58f',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 165,
      maxForce: 0.36,
      angularTorque: 0.065,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // Compute perfect original aspect ratio
      const targetH = 185;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (158 / 631);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Hanging Top Loop Gold Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#faad14';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Top Red Raksha Knot
      ctx.beginPath();
      ctx.arc(0, topY, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#cf1322';
      ctx.fill();
      ctx.restore();

      // 2. Draw Vel Pendant Image with Soft Golden Radiance (True Aspect Ratio)
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(250, 173, 20, 0.38)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Sacred Raksha Threads attached at the bottom tip
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -3, attachY: bottomY, dropLen: 32, stiffness: 0.12, damping: 0.86, restAngle: -0.05, base: '#cf1322', highlight: '#ff7875', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.0, width: 2.2, shadowColor: 'rgba(40, 10, 0, 0.30)' },
        { attachX: 3, attachY: bottomY, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.05, base: '#d48806', highlight: '#ffe58f', dash: [3, 2], tipColor: '#cf1322', tipRadius: 2.0, width: 2.2, shadowColor: 'rgba(40, 10, 0, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.murugan_vel_pendant.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  murugan_vel_mayil: {
    id: 'murugan_vel_mayil',
    name: 'Mayil & Vel (Peacock & Spear)',
    culture: 'Tamil Hindu',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.44,
    knotOffset: -82,
    drawW: 88,
    drawH: 185,
    yOffset: 12,
    dataUri: 'murugan_vel_mayil.png',
    cord: {
      width: 3.2,
      baseColor: '#006d75',
      highlightColor: '#87e8de',
      shadowColor: 'rgba(0, 30, 35, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#d48806',
      knotHighlightColor: '#ffd666',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // Compute perfect original aspect ratio
      const targetH = 185;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (299 / 631);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Top Peacock-Green & Gold Knot
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 5.0, 0, Math.PI * 2);
      ctx.fillStyle = '#faad14';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, topY, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#08979c';
      ctx.fill();
      ctx.restore();

      // 2. Main Vel & Peacock Image (True Aspect Ratio)
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(8, 151, 156, 0.32)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Emerald & Saffron Feather Strings
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 10, dropLen: 38, stiffness: 0.12, damping: 0.85, restAngle: -0.10, base: '#006d75', highlight: '#5cdbd3', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(0, 30, 35, 0.28)' },
        { attachX: 0, attachY: bottomY, dropLen: 42, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#d48806', highlight: '#ffe58f', dash: [3, 2], tipColor: '#13c2c2', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(30, 20, 0, 0.28)' },
        { attachX: 12, attachY: bottomY - 12, dropLen: 36, stiffness: 0.13, damping: 0.86, restAngle: 0.08, base: '#006d75', highlight: '#5cdbd3', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.0, width: 2.2, shadowColor: 'rgba(0, 30, 35, 0.28)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.murugan_vel_mayil.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  murugan_yamirukka: {
    id: 'murugan_yamirukka',
    name: 'Yamirukka Bayamen (Portrait)',
    culture: 'Tamil Hindu',
    radius: 54,
    initialY: 200,
    density: 0.016,
    restitution: 0.40,
    knotOffset: -75,
    drawW: 115,
    drawH: 153,
    yOffset: 0,
    dataUri: 'murugan_yamirukka.png',
    cord: {
      width: 3.4,
      baseColor: '#ad4e00',
      highlightColor: '#ffbb96',
      shadowColor: 'rgba(50, 15, 0, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#873800',
      knotHighlightColor: '#ffd591',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.35,
      angularTorque: 0.06,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // Compute perfect original aspect ratio
      const targetH = 155;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (457 / 607);
      const targetW = targetH * aspect;
      const topY = -75;

      // 1. Sacred Rudraksha Bead Top Anchor
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#613400';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-1.5, topY - 1.5, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#d48806';
      ctx.fill();
      ctx.restore();

      // 2. Portrait Medallion (True Aspect Ratio)
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 197, 61, 0.40)';
        ctx.shadowBlur = 16;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Saffron Tassel Strings
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -18, attachY: bottomY - 4, dropLen: 30, stiffness: 0.12, damping: 0.86, restAngle: -0.05, base: '#ad4e00', highlight: '#ffd591', dash: [3, 2], tipColor: '#613400', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 10, 0, 0.25)' },
        { attachX: 18, attachY: bottomY - 4, dropLen: 30, stiffness: 0.12, damping: 0.86, restAngle: 0.05, base: '#ad4e00', highlight: '#ffd591', dash: [3, 2], tipColor: '#613400', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 10, 0, 0.25)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.murugan_yamirukka.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  murugan_bayamen_badge: {
    id: 'murugan_bayamen_badge',
    name: 'Yamirukka Bayamen (Tamil Calligraphy)',
    culture: 'Tamil Hindu',
    radius: 52,
    initialY: 200,
    density: 0.017,
    restitution: 0.42,
    knotOffset: -65,
    drawW: 135,
    drawH: 112,
    yOffset: 0,
    dataUri: 'murugan_bayamen_badge.png',
    cord: {
      width: 3.2,
      baseColor: '#820014',
      highlightColor: '#ff7875',
      shadowColor: 'rgba(40, 0, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#faad14',
      knotHighlightColor: '#fff1b8',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 170,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      // Compute perfect original aspect ratio
      const targetW = 140;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalHeight / img.naturalWidth) : (488 / 589);
      const targetH = targetW * aspect;
      const topY = -65;

      // 1. Top Golden Spear Tip Knot
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#faad14';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#cf1322';
      ctx.fill();
      ctx.restore();

      // 2. Calligraphy Badge (True Aspect Ratio)
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(168, 7, 26, 0.35)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Crimson Silk Threads with Brass Caps
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -16, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#820014', highlight: '#ff7875', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 0, 10, 0.30)' },
        { attachX: 16, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#820014', highlight: '#ff7875', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 0, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.murugan_bayamen_badge.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  shiva_gold_nataraj: {
    id: 'shiva_gold_nataraj',
    name: 'Chidambaram Nataraja (Cosmic Dancer)',
    culture: 'Tamil Shaiva',
    radius: 46,
    initialY: 200,
    density: 0.0155,
    restitution: 0.46,
    knotOffset: -75,
    drawW: 125,
    drawH: 166,
    yOffset: 0,
    dataUri: 'shiva_gold_nataraj.png',
    cord: {
      width: 3.4,
      baseColor: '#0b1d3a',
      highlightColor: '#d4af37',
      shadowColor: 'rgba(5, 10, 25, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#d4af37',
      knotHighlightColor: '#fff1b8',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.40,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 166;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (339 / 451);
      const targetW = targetH * aspect;
      const topY = -75;

      // 1. Top Hanging Loop Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, topY, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = '#0b1d3a';
      ctx.fill();
      ctx.restore();

      // 2. Nataraja Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(212, 175, 55, 0.38)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Cosmic Navy & Gold Strings
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#0b1d3a', highlight: '#d4af37', dash: [3, 2], tipColor: '#d4af37', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(5, 10, 25, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#0b1d3a', highlight: '#d4af37', dash: [3, 2], tipColor: '#d4af37', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(5, 10, 25, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.shiva_gold_nataraj.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  shiva_shivling: {
    id: 'shiva_shivling',
    name: 'Surya Prabha Shivling (சூரிய பிரபை)',
    culture: 'Tamil Shaiva',
    radius: 44,
    initialY: 200,
    density: 0.0145,
    restitution: 0.48,
    knotOffset: -75,
    drawW: 122,
    drawH: 165,
    yOffset: 0,
    dataUri: 'shiva_shivling.png',
    cord: {
      width: 3.2,
      baseColor: '#d48806',
      highlightColor: '#ffe58f',
      shadowColor: 'rgba(40, 20, 0, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#ad6800',
      knotHighlightColor: '#ffd666',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.40,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 165;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (292 / 397);
      const targetW = targetH * aspect;
      const topY = -75;

      // 1. Top Loop
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#faad14';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();

      // 2. Shivling Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(250, 173, 20, 0.38)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Sacred Holy Ash & Saffron Threads
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -12, attachY: bottomY - 8, dropLen: 32, stiffness: 0.12, damping: 0.86, restAngle: -0.05, base: '#d48806', highlight: '#ffe58f', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 20, 0, 0.28)' },
        { attachX: 12, attachY: bottomY - 8, dropLen: 32, stiffness: 0.12, damping: 0.86, restAngle: 0.05, base: '#d48806', highlight: '#ffe58f', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 20, 0, 0.28)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.shiva_shivling.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  shiva_gold_trishul: {
    id: 'shiva_gold_trishul',
    name: 'Gold Trishul & Damru (திரிசூலம்)',
    culture: 'Tamil Shaiva',
    radius: 42,
    initialY: 200,
    density: 0.0150,
    restitution: 0.46,
    knotOffset: -80,
    drawW: 90,
    drawH: 170,
    yOffset: 6,
    dataUri: 'shiva_gold_trishul.png',
    cord: {
      width: 3.4,
      baseColor: '#faad14',
      highlightColor: '#fff1b8',
      shadowColor: 'rgba(50, 20, 0, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#ad6800',
      knotHighlightColor: '#ffd666',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.42,
      angularTorque: 0.080,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 170;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (277 / 522);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Top Loop
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#faad14';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();

      // 2. Gold Trishul Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(250, 173, 20, 0.40)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Crimson & Gold Tassels
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -4, attachY: bottomY, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#cf1322', highlight: '#ff7875', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 0, 0.30)' },
        { attachX: 4, attachY: bottomY, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#faad14', highlight: '#fff1b8', dash: [3, 2], tipColor: '#cf1322', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(40, 10, 0, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.shiva_gold_trishul.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  shiva_rudraksham: {
    id: 'shiva_rudraksham',
    name: 'Trishul & 5-Mukhi Rudraksha (ருத்ராட்சம்)',
    culture: 'Tamil Shaiva',
    radius: 38,
    initialY: 200,
    density: 0.0150,
    restitution: 0.46,
    knotOffset: -82,
    drawW: 52,
    drawH: 180,
    yOffset: 8,
    dataUri: 'shiva_rudraksham.png',
    cord: {
      width: 3.2,
      baseColor: '#ad4e00',
      highlightColor: '#ffbb96',
      shadowColor: 'rgba(50, 15, 0, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#613400',
      knotHighlightColor: '#ffd591',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 170,
      maxForce: 0.40,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 180;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (183 / 633);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Top Loop with Rudraksha bead
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#faad14';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, topY, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#613400';
      ctx.fill();
      ctx.restore();

      // 2. Rudraksham Pendant Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(212, 136, 6, 0.38)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Saffron Tassels
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -3, attachY: bottomY, dropLen: 30, stiffness: 0.12, damping: 0.86, restAngle: -0.05, base: '#ad4e00', highlight: '#ffd591', dash: [3, 2], tipColor: '#613400', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 10, 0, 0.25)' },
        { attachX: 3, attachY: bottomY, dropLen: 30, stiffness: 0.12, damping: 0.86, restAngle: 0.05, base: '#ad4e00', highlight: '#ffd591', dash: [3, 2], tipColor: '#613400', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 10, 0, 0.25)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.shiva_rudraksham.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  sai_isai: {
    id: 'sai_isai',
    name: 'iSai (iSai Baba Meme Charm)',
    culture: 'Meme & Pop Culture',
    radius: 52,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -80,
    drawW: 135,
    drawH: 145,
    yOffset: 0,
    dataUri: 'iSai.png',
    cord: {
      width: 3.4,
      baseColor: '#c0392b',
      highlightColor: '#f1c40f',
      shadowColor: 'rgba(50, 10, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#e74c3c',
      knotHighlightColor: '#f39c12',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 145;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (451 / 486);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Top Knot & Loop
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY - 1, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#c0392b';
      ctx.fill();
      ctx.restore();

      // 2. iSai Medallion with Warm Radiant Glow
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(231, 76, 60, 0.38)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 3;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Vermilion & Saffron Silk Tassels
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 36, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#c0392b', highlight: '#f39c12', dash: [3, 2], tipColor: '#f1c40f', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 10, 10, 0.28)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 36, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#f39c12', highlight: '#f1c40f', dash: [3, 2], tipColor: '#c0392b', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 10, 10, 0.28)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.sai_isai.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  sai_dwarkamai: {
    id: 'sai_dwarkamai',
    name: 'Dwarkamai Sai (Shraddha & Saburi)',
    culture: 'Shirdi Devotional',
    radius: 50,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -78,
    drawW: 130,
    drawH: 152,
    yOffset: 0,
    dataUri: 'sai_1.png',
    cord: {
      width: 3.4,
      baseColor: '#d48806',
      highlightColor: '#ffe58f',
      shadowColor: 'rgba(50, 30, 0, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#ad6800',
      knotHighlightColor: '#ffd666',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 152;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (438 / 509);
      const targetW = targetH * aspect;
      const topY = -78;

      // 1. Top Sacred Golden Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#faad14';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();

      // 2. Dwarkamai Sai Portrait
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(250, 173, 20, 0.40)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Sacred Golden Temple Tassels
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -12, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.05, base: '#d48806', highlight: '#ffe58f', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 20, 0, 0.28)' },
        { attachX: 12, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: 0.05, base: '#d48806', highlight: '#ffe58f', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(40, 20, 0, 0.28)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.sai_dwarkamai.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  sai_samadhi: {
    id: 'sai_samadhi',
    name: 'Shirdi Sai (Orange Headdress)',
    culture: 'Shirdi Devotional',
    radius: 52,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -80,
    drawW: 135,
    drawH: 135,
    yOffset: 0,
    dataUri: 'sai_2.png',
    cord: {
      width: 3.4,
      baseColor: '#d35400',
      highlightColor: '#f39c12',
      shadowColor: 'rgba(45, 15, 0, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#ad4e00',
      knotHighlightColor: '#ffd591',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 138;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (475 / 466);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Top Sacred Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#d35400';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#f39c12';
      ctx.fill();
      ctx.restore();

      // 2. Shirdi Sai Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(211, 84, 0, 0.38)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Saffron Tassels
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#d35400', highlight: '#f39c12', dash: [3, 2], tipColor: '#faad14', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 0, 0.28)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#ad4e00', highlight: '#ffd591', dash: [3, 2], tipColor: '#d35400', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 0, 0.28)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.sai_samadhi.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  sai_silver: {
    id: 'sai_silver',
    name: 'Sai Avadhoota (White Robes)',
    culture: 'Shirdi Devotional',
    radius: 48,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -82,
    drawW: 120,
    drawH: 158,
    yOffset: 0,
    dataUri: 'sai_3.png',
    cord: {
      width: 3.2,
      baseColor: '#7f8c8d',
      highlightColor: '#ecf0f1',
      shadowColor: 'rgba(20, 25, 30, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#2c3e50',
      knotHighlightColor: '#bdc3c7',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 158;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (416 / 546);
      const targetW = targetH * aspect;
      const topY = -82;

      // 1. Top Sacred Silver/Gold Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();

      // 2. White-Robed Sai Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(236, 240, 241, 0.45)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      // 3. Trailing Silver & Pearl White Cords
      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -12, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.05, base: '#7f8c8d', highlight: '#ecf0f1', dash: [3, 2], tipColor: '#bdc3c7', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(20, 25, 30, 0.25)' },
        { attachX: 12, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: 0.05, base: '#7f8c8d', highlight: '#ecf0f1', dash: [3, 2], tipColor: '#bdc3c7', tipRadius: 2.2, width: 2.2, shadowColor: 'rgba(20, 25, 30, 0.25)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.sai_silver.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  meme_megan_fox: {
    id: 'meme_megan_fox',
    name: 'Megan Fox',
    culture: 'Meme & Pop Culture',
    radius: 50,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -80,
    drawW: 120,
    drawH: 155,
    yOffset: 0,
    dataUri: 'meme_megan_fox.png',
    cord: {
      width: 3.2,
      baseColor: '#d63031',
      highlightColor: '#ff7675',
      shadowColor: 'rgba(50, 10, 20, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#e84393',
      knotHighlightColor: '#fd79a8',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 155;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (399 / 575);
      const targetW = targetH * aspect;
      const topY = -80;

      // 1. Top Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.6, 0, Math.PI * 2);
      ctx.fillStyle = '#e84393';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#fd79a8';
      ctx.fill();
      ctx.restore();

      // 2. Image with subtle radiant glow
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(232, 67, 147, 0.35)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }
    }
  },

  meme_sydney_sweeney: {
    id: 'meme_sydney_sweeney',
    name: 'Sydney Sweeney',
    culture: 'Meme & Pop Culture',
    radius: 48,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -78,
    drawW: 125,
    drawH: 142,
    yOffset: 0,
    dataUri: 'meme_sydney_sweeney.png',
    cord: {
      width: 3.2,
      baseColor: '#6c5ce7',
      highlightColor: '#a29bfe',
      shadowColor: 'rgba(30, 20, 60, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#fd79a8',
      knotHighlightColor: '#ffeaa7',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 142;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (252 / 336);
      const targetW = targetH * aspect;
      const topY = -78;

      // 1. Top Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.6, 0, Math.PI * 2);
      ctx.fillStyle = '#fd79a8';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeaa7';
      ctx.fill();
      ctx.restore();

      // 2. Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(108, 92, 231, 0.35)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }
    }
  },

  meme_ajith: {
    id: 'meme_ajith',
    name: 'Thala Ajith',
    culture: 'Meme & Pop Culture',
    radius: 50,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -78,
    drawW: 145,
    drawH: 130,
    yOffset: 0,
    dataUri: 'meme_ajith.png',
    cord: {
      width: 3.4,
      baseColor: '#2d3436',
      highlightColor: '#dfe6e9',
      shadowColor: 'rgba(20, 20, 20, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#636e72',
      knotHighlightColor: '#ffffff',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 130;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (345 / 275);
      const targetW = targetH * aspect;
      const topY = -78;

      // 1. Top Racing Metallic Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#636e72';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#dfe6e9';
      ctx.fill();
      ctx.restore();

      // 2. Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(45, 52, 54, 0.4)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }
    }
  },

  meme_vijay: {
    id: 'meme_vijay',
    name: 'Thalapathy Vijay (Action)',
    culture: 'Meme & Pop Culture',
    radius: 50,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -78,
    drawW: 135,
    drawH: 132,
    yOffset: 0,
    dataUri: 'meme_vijay.png',
    cord: {
      width: 3.4,
      baseColor: '#d63031',
      highlightColor: '#f1c40f',
      shadowColor: 'rgba(60, 10, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#c0392b',
      knotHighlightColor: '#e67e22',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 132;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (272 / 264);
      const targetW = targetH * aspect;
      const topY = -78;

      // 1. Top Fire Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.fillStyle = '#d63031';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fill();
      ctx.restore();

      // 2. Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(214, 48, 49, 0.4)';
        ctx.shadowBlur = 14;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }
    }
  },

  meme_wamiqa: {
    id: 'meme_wamiqa',
    name: 'Wamiqa Gabbi',
    culture: 'Meme & Pop Culture',
    radius: 48,
    initialY: 200,
    density: 0.016,
    restitution: 0.42,
    knotOffset: -78,
    drawW: 130,
    drawH: 135,
    yOffset: 0,
    dataUri: 'meme_wamiqa.png',
    cord: {
      width: 3.2,
      baseColor: '#00b894',
      highlightColor: '#ffeaa7',
      shadowColor: 'rgba(10, 40, 30, 0.42)',
      hasKnotDot: true,
      knotBaseColor: '#00cec9',
      knotHighlightColor: '#55efc4',
      dash: [4, 2]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 135;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (244 / 265);
      const targetW = targetH * aspect;
      const topY = -78;

      // 1. Top Emerald Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.6, 0, Math.PI * 2);
      ctx.fillStyle = '#00b894';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, topY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#55efc4';
      ctx.fill();
      ctx.restore();

      // 2. Image
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 184, 148, 0.38)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }
    }
  },

  balaji_classic: {
    id: 'balaji_classic',
    name: 'Lord Venkateswara (ஏழுமலையான் பாலாஜி)',
    culture: 'Tamil Vaishnava',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 105,
    drawH: 194,
    yOffset: 0,
    dataUri: 'balaji_classic.png',
    cord: {
      width: 3.5,
      baseColor: '#b71540',
      highlightColor: '#f6b93b',
      shadowColor: 'rgba(40, 10, 20, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#f6b93b',
      knotHighlightColor: '#ffd700',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.37,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 194;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (198 / 360);
      const targetW = targetH * aspect;
      const topY = -85;

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, topY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b71540';
      ctx.fill();
      ctx.restore();

      ctx.save();
      const grad = ctx.createRadialGradient(0, topY + targetH * 0.45, 15, 0, topY + targetH * 0.45, targetW * 0.75);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.38)');
      grad.addColorStop(0.5, 'rgba(243, 156, 18, 0.16)');
      grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, topY + targetH * 0.45, targetW * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.42)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b71540', highlight: '#f6b93b', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 20, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#b71540', highlight: '#f6b93b', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 20, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.balaji_classic.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  balaji_modern_1: {
    id: 'balaji_modern_1',
    name: 'Modern Balaji Gold (நவீன பாலாஜி 1)',
    culture: 'Tamil Vaishnava',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 100,
    drawH: 195,
    yOffset: 0,
    dataUri: 'balaji_modern_1.png',
    cord: {
      width: 3.5,
      baseColor: '#e58e26',
      highlightColor: '#ffd32a',
      shadowColor: 'rgba(50, 20, 0, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd32a',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.37,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 195;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (189 / 444);
      const targetW = targetH * aspect;
      const topY = -85;

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, topY, 4.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, topY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e58e26';
      ctx.fill();
      ctx.restore();

      ctx.save();
      const grad = ctx.createRadialGradient(0, topY + targetH * 0.45, 15, 0, topY + targetH * 0.45, targetW * 0.8);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
      grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, topY + targetH * 0.45, targetW * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 16;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -12, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#e58e26', highlight: '#ffd32a', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 20, 0, 0.30)' },
        { attachX: 12, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#e58e26', highlight: '#ffd32a', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 20, 0, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.balaji_modern_1.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  balaji_modern_2: {
    id: 'balaji_modern_2',
    name: 'Modern Balaji Aura (நவீன பாலாஜி 2)',
    culture: 'Tamil Vaishnava',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 105,
    drawH: 194,
    yOffset: 0,
    dataUri: 'balaji_modern_2.png',
    cord: {
      width: 3.5,
      baseColor: '#b71540',
      highlightColor: '#f6b93b',
      shadowColor: 'rgba(40, 10, 20, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#f6b93b',
      knotHighlightColor: '#ffd700',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 194;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (188 / 393);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.42)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b71540', highlight: '#f6b93b', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 20, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#b71540', highlight: '#f6b93b', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 20, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.balaji_modern_2.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  balaji_platinum: {
    id: 'balaji_platinum',
    name: 'Platinum Balaji (பிளாட்டினம் பாலாஜி)',
    culture: 'Tamil Vaishnava',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 110,
    drawH: 190,
    yOffset: 0,
    dataUri: 'balaji_platinum.png',
    cord: {
      width: 3.5,
      baseColor: '#718093',
      highlightColor: '#dcdde1',
      shadowColor: 'rgba(30, 40, 50, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#dcdde1',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.37,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 190;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (236 / 373);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(220, 221, 225, 0.55)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#718093', highlight: '#f5f6fa', dash: [3, 2], tipColor: '#ffffff', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(20, 30, 40, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#718093', highlight: '#f5f6fa', dash: [3, 2], tipColor: '#ffffff', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(20, 30, 40, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.balaji_platinum.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  krishna_flute: {
    id: 'krishna_flute',
    name: 'Venugopala Krishna (புல்லாங்குழல் கிருஷ்ணர்)',
    culture: 'Vedic Devotional',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 100,
    drawH: 196,
    yOffset: 0,
    dataUri: 'krishna_flute.png',
    cord: {
      width: 3.5,
      baseColor: '#0984e3',
      highlightColor: '#ffeaa7',
      shadowColor: 'rgba(0, 30, 60, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffeaa7',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.39,
      angularTorque: 0.085,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 196;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (198 / 491);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(9, 132, 227, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#0984e3', highlight: '#ffeaa7', dash: [3, 2], tipColor: '#ffeaa7', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 30, 60, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#0984e3', highlight: '#ffeaa7', dash: [3, 2], tipColor: '#ffeaa7', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 30, 60, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.krishna_flute.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  durga_ma: {
    id: 'durga_ma',
    name: 'Durga Ma Shakthi (வீர துர்க்கை அம்மன்)',
    culture: 'Shakthi Devotional',
    radius: 48,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 130,
    drawH: 192,
    yOffset: 0,
    dataUri: 'durga_ma.png',
    cord: {
      width: 3.5,
      baseColor: '#d63031',
      highlightColor: '#fdcb6e',
      shadowColor: 'rgba(60, 10, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#fdcb6e',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.40,
      angularTorque: 0.085,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 192;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (299 / 440);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(214, 48, 49, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -16, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#d63031', highlight: '#fdcb6e', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(60, 10, 10, 0.30)' },
        { attachX: 16, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#d63031', highlight: '#fdcb6e', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(60, 10, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.durga_ma.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  hanuman_anjaneyar: {
    id: 'hanuman_anjaneyar',
    name: 'Veera Anjaneyar (வீர ஆஞ்சநேயர்)',
    culture: 'Hindu Devotional',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 98,
    drawH: 196,
    yOffset: 0,
    dataUri: 'hanuman_anjaneyar.png',
    cord: {
      width: 3.5,
      baseColor: '#e67e22',
      highlightColor: '#f1c40f',
      shadowColor: 'rgba(50, 20, 0, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#f1c40f',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.41,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.2
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 196;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (193 / 486);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(230, 126, 34, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#e67e22', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 20, 0, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#e67e22', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 20, 0, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.hanuman_anjaneyar.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  ayyappa_swamy: {
    id: 'ayyappa_swamy',
    name: 'Sabarimala Ayyappa (சுவாமியே சரணம் ஐயப்பா)',
    culture: 'Tamil & Kerala Devotional',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 105,
    drawH: 190,
    yOffset: 0,
    dataUri: 'ayyappa_swamy.png',
    cord: {
      width: 3.5,
      baseColor: '#2d3436',
      highlightColor: '#e17055',
      shadowColor: 'rgba(10, 10, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#e17055',
      knotHighlightColor: '#ffeaa7',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 190;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (191 / 342);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.42)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#2d3436', highlight: '#e17055', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(10, 10, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#2d3436', highlight: '#e17055', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(10, 10, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.ayyappa_swamy.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  vedic_swastik: {
    id: 'vedic_swastik',
    name: 'Sacred Vedic Swastik (மங்கள சுவஸ்திக்)',
    culture: 'Vedic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 115,
    drawH: 194,
    yOffset: 0,
    dataUri: 'vedic_swastik.png',
    cord: {
      width: 3.5,
      baseColor: '#c0392b',
      highlightColor: '#f39c12',
      shadowColor: 'rgba(50, 10, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#f39c12',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 194;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (270 / 456);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(243, 156, 18, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#c0392b', highlight: '#f39c12', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 10, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#c0392b', highlight: '#f39c12', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(50, 10, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.vedic_swastik.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  christian_holy_cross: {
    id: 'christian_holy_cross',
    name: 'Sacred Holy Cross (புனித சிலுவை)',
    culture: 'Christian',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 105,
    drawH: 194,
    yOffset: 0,
    dataUri: 'christian_holy_cross.png',
    cord: {
      width: 3.5,
      baseColor: '#b8860b',
      highlightColor: '#fdf5e6',
      shadowColor: 'rgba(40, 30, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#fdf5e6',
      knotHighlightColor: '#ffd700',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 194;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (185 / 342);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b8860b', highlight: '#fdf5e6', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 30, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#b8860b', highlight: '#fdf5e6', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 30, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.christian_holy_cross.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  christian_siluvai_1: {
    id: 'christian_siluvai_1',
    name: 'Golden Siluvai (பொன் சிலுவை)',
    culture: 'Christian Tamil',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 95,
    drawH: 196,
    yOffset: 0,
    dataUri: 'christian_siluvai_1.png',
    cord: {
      width: 3.5,
      baseColor: '#d4af37',
      highlightColor: '#ffffff',
      shadowColor: 'rgba(40, 30, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#d4af37',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 196;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (210 / 432);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(212, 175, 55, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#d4af37', highlight: '#ffffff', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 30, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#d4af37', highlight: '#ffffff', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 30, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.christian_siluvai_1.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  christian_siluvai_2: {
    id: 'christian_siluvai_2',
    name: 'Ornate Siluvai Cross (அலங்கார சிலுவை)',
    culture: 'Christian Tamil',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 92,
    drawH: 198,
    yOffset: 0,
    dataUri: 'christian_siluvai_2.png',
    cord: {
      width: 3.5,
      baseColor: '#2c3e50',
      highlightColor: '#f1c40f',
      shadowColor: 'rgba(10, 20, 30, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#f1c40f',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 198;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (192 / 414);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(241, 196, 15, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#2c3e50', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(10, 20, 30, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#2c3e50', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(10, 20, 30, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.christian_siluvai_2.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  christian_cross_3: {
    id: 'christian_cross_3',
    name: 'Radiant Cross Pendant (ஒளிரும் சிலுவை)',
    culture: 'Christian',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 104,
    drawH: 200,
    yOffset: 0,
    dataUri: 'christian_cross_3.png',
    cord: {
      width: 3.5,
      baseColor: '#c0392b',
      highlightColor: '#ffffff',
      shadowColor: 'rgba(40, 10, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffffff',
      knotHighlightColor: '#ffd700',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.39,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 200;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (216 / 414);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.55)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#c0392b', highlight: '#ffffff', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#c0392b', highlight: '#ffffff', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 10, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.christian_cross_3.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  christian_yesappa: {
    id: 'christian_yesappa',
    name: 'Sacred Heart Yesappa (இயேசு கிறிஸ்து)',
    culture: 'Christian Tamil',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 90,
    drawH: 196,
    yOffset: 0,
    dataUri: 'christian_yesappa.png',
    cord: {
      width: 3.5,
      baseColor: '#8e44ad',
      highlightColor: '#f1c40f',
      shadowColor: 'rgba(30, 10, 40, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#f1c40f',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 196;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (180 / 393);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(241, 196, 15, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#8e44ad', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(30, 10, 40, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#8e44ad', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(30, 10, 40, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.christian_yesappa.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_crescent: {
    id: 'islam_crescent',
    name: 'Islamic Crescent & Star (பிறை நிலவு & நட்சத்திரம்)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 122,
    drawH: 196,
    yOffset: 0,
    dataUri: 'islam_crescent.png',
    cord: {
      width: 3.5,
      baseColor: '#009432',
      highlightColor: '#ffd700',
      shadowColor: 'rgba(0, 40, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.39,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 196;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (234 / 375);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 148, 50, 0.50)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_crescent.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_mosque: {
    id: 'islam_mosque',
    name: 'Golden Dome Mosque (புனித மசூதி)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 120,
    drawH: 194,
    yOffset: 0,
    dataUri: 'islam_mosque.png',
    cord: {
      width: 3.5,
      baseColor: '#009432',
      highlightColor: '#f5f6fa',
      shadowColor: 'rgba(0, 40, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 194;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (234 / 379);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#009432', highlight: '#f5f6fa', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#009432', highlight: '#f5f6fa', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_mosque.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_mosque_1: {
    id: 'islam_mosque_1',
    name: 'Masjid Al-Haram Gold (புனித பள்ளிவாசல் 1)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 124,
    drawH: 195,
    yOffset: 0,
    dataUri: 'islam_mosque_1.png',
    cord: {
      width: 3.5,
      baseColor: '#009432',
      highlightColor: '#ffd700',
      shadowColor: 'rgba(0, 40, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 195;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (249 / 391);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_mosque_1.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_calligraphy_medallion: {
    id: 'islam_calligraphy_medallion',
    name: 'Allah Sacred Calligraphy (அல்லாஹ் திருநாமம்)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 145,
    drawH: 186,
    yOffset: 0,
    dataUri: 'islam_calligraphy_medallion.png',
    cord: {
      width: 3.5,
      baseColor: '#b8860b',
      highlightColor: '#f1c40f',
      shadowColor: 'rgba(40, 30, 0, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.40,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 186;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (307 / 394);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b8860b', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 30, 0, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#b8860b', highlight: '#f1c40f', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 30, 0, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_calligraphy_medallion.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_mosque_minaret: {
    id: 'islam_mosque_minaret',
    name: 'Luminous Minaret Mosque (மினாரட் மசூதி)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 148,
    drawH: 190,
    yOffset: 0,
    dataUri: 'islam_mosque_minaret.png',
    cord: {
      width: 3.5,
      baseColor: '#009432',
      highlightColor: '#f5f6fa',
      shadowColor: 'rgba(0, 40, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.39,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 190;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (333 / 428);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 148, 50, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#009432', highlight: '#f5f6fa', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#009432', highlight: '#f5f6fa', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_mosque_minaret.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_crescent_lantern: {
    id: 'islam_crescent_lantern',
    name: 'Golden Crescent & Lantern (பிறை நிலவு & விளக்கு)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 116,
    drawH: 190,
    yOffset: 0,
    dataUri: 'islam_crescent_lantern.png',
    cord: {
      width: 3.5,
      baseColor: '#e58e26',
      highlightColor: '#ffd32a',
      shadowColor: 'rgba(40, 20, 0, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd32a',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 190;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (219 / 358);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(243, 156, 18, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#e58e26', highlight: '#ffd32a', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 20, 0, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#e58e26', highlight: '#ffd32a', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(40, 20, 0, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_crescent_lantern.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_shahada_gold: {
    id: 'islam_shahada_gold',
    name: 'Sacred Shahada Shield (புனித கலிமா சின்னம்)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 112,
    drawH: 190,
    yOffset: 0,
    dataUri: 'islam_shahada_gold.png',
    cord: {
      width: 3.5,
      baseColor: '#009432',
      highlightColor: '#ffd700',
      shadowColor: 'rgba(0, 40, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 190;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (201 / 342);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_shahada_gold.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  islam_crescent_floral: {
    id: 'islam_crescent_floral',
    name: 'Filigree Crescent Moon (அலங்கார பிறை நிலவு)',
    culture: 'Islamic Sacred',
    radius: 46,
    initialY: 200,
    density: 0.018,
    restitution: 0.42,
    knotOffset: -85,
    drawW: 118,
    drawH: 190,
    yOffset: 0,
    dataUri: 'islam_crescent_floral.png',
    cord: {
      width: 3.5,
      baseColor: '#009432',
      highlightColor: '#ffd700',
      shadowColor: 'rgba(0, 40, 10, 0.45)',
      hasKnotDot: true,
      knotBaseColor: '#ffd700',
      knotHighlightColor: '#ffffff',
      dash: [4, 3]
    },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.38,
      angularTorque: 0.075,
      catchSpeedThreshold: 7.0
    },
    stringsState: [
      { angle: 0, vel: 0, bowX: 0 },
      { angle: 0, vel: 0, bowX: 0 }
    ],
    renderCustom: (ctx, charm, img, state, extraAssets, mousePos) => {
      const targetH = 190;
      const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (209 / 337);
      const targetW = targetH * aspect;
      const topY = -85;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.45)';
        ctx.shadowBlur = 18;
        ctx.drawImage(img, -targetW / 2, topY, targetW, targetH);
        ctx.restore();
      }

      const bottomY = topY + targetH;
      const stringConfigs = [
        { attachX: -14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' },
        { attachX: 14, attachY: bottomY - 6, dropLen: 34, stiffness: 0.11, damping: 0.87, restAngle: 0.06, base: '#009432', highlight: '#ffd700', dash: [3, 2], tipColor: '#ffd700', tipRadius: 2.2, width: 2.4, shadowColor: 'rgba(0, 40, 10, 0.30)' }
      ];
      drawZeroGravityStrings(ctx, charm, CHARMS.islam_crescent_floral.stringsState, stringConfigs, mousePos || state?.mousePos);
    }
  },

  // 10. BUBU & DUDU (CUTE PANDA & BEAR)
  bubu_1: {
    id: 'bubu_1',
    name: 'Bubu Blushing Heart',
    category: 'bubu_dudu',
    image: 'bubu_1.png',
    radius: 42,
    knotOffset: -45,
    stringColor: { base: '#EC4899', highlight: '#FBCFE8' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.44,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_2: {
    id: 'bubu_2',
    name: 'Bubu Joyful Wave',
    category: 'bubu_dudu',
    image: 'bubu_2.png',
    radius: 42,
    knotOffset: -45,
    stringColor: { base: '#F472B6', highlight: '#FCE7F3' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.45,
      angularTorque: 0.09,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_3: {
    id: 'bubu_3',
    name: 'Bubu Cozy Pillow',
    category: 'bubu_dudu',
    image: 'bubu_3.png',
    radius: 45,
    knotOffset: -40,
    stringColor: { base: '#FB7185', highlight: '#FFE4E6' },
    reluctance: {
      enabled: true,
      triggerRadius: 175,
      maxForce: 0.38,
      angularTorque: 0.06,
      catchSpeedThreshold: 6.8
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 130;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_4: {
    id: 'bubu_4',
    name: 'Bubu Happy Dance',
    category: 'bubu_dudu',
    image: 'bubu_4.png',
    radius: 40,
    knotOffset: -45,
    stringColor: { base: '#F43F5E', highlight: '#FDA4AF' },
    reluctance: {
      enabled: true,
      triggerRadius: 195,
      maxForce: 0.48,
      angularTorque: 0.10,
      catchSpeedThreshold: 7.5
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_5: {
    id: 'bubu_5',
    name: 'Bubu Warm Winter Hat',
    category: 'bubu_dudu',
    image: 'bubu_5.png',
    radius: 42,
    knotOffset: -42,
    stringColor: { base: '#FB923C', highlight: '#FED7AA' },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.42,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 130;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_6: {
    id: 'bubu_6',
    name: 'Bubu Sweet Smile',
    category: 'bubu_dudu',
    image: 'bubu_6.png',
    radius: 40,
    knotOffset: -40,
    stringColor: { base: '#F472B6', highlight: '#FCE7F3' },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.42,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 130;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_7: {
    id: 'bubu_7',
    name: 'Bubu Cheerful Hug',
    category: 'bubu_dudu',
    image: 'bubu_7.png',
    radius: 42,
    knotOffset: -42,
    stringColor: { base: '#E11D48', highlight: '#FDA4AF' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.45,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_8: {
    id: 'bubu_8',
    name: 'Bubu Sparkle Eyes',
    category: 'bubu_dudu',
    image: 'bubu_8.png',
    radius: 42,
    knotOffset: -45,
    stringColor: { base: '#A855F7', highlight: '#E9D5FF' },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.46,
      angularTorque: 0.09,
      catchSpeedThreshold: 7.4
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_9: {
    id: 'bubu_9',
    name: 'Bubu Playful Wink',
    category: 'bubu_dudu',
    image: 'bubu_9.png',
    radius: 42,
    knotOffset: -42,
    stringColor: { base: '#EC4899', highlight: '#FCE7F3' },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.46,
      angularTorque: 0.09,
      catchSpeedThreshold: 7.3
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  dudu_1: {
    id: 'dudu_1',
    name: 'Dudu Gentle Brown Bear',
    category: 'bubu_dudu',
    image: 'dudu_1.png',
    radius: 42,
    knotOffset: -45,
    stringColor: { base: '#A16207', highlight: '#FEF08A' },
    reluctance: {
      enabled: true,
      triggerRadius: 180,
      maxForce: 0.42,
      angularTorque: 0.07,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  dudu_2: {
    id: 'dudu_2',
    name: 'Dudu Sleepy Head',
    category: 'bubu_dudu',
    image: 'dudu_2.png',
    radius: 42,
    knotOffset: -42,
    stringColor: { base: '#B45309', highlight: '#FDE68A' },
    reluctance: {
      enabled: true,
      triggerRadius: 170,
      maxForce: 0.36,
      angularTorque: 0.06,
      catchSpeedThreshold: 6.5
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  dudu_3: {
    id: 'dudu_3',
    name: 'Dudu Cool Sunglasses',
    category: 'bubu_dudu',
    image: 'dudu_3.png',
    radius: 40,
    knotOffset: -40,
    stringColor: { base: '#1E293B', highlight: '#94A3B8' },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.45,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 130;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  dudu_4: {
    id: 'dudu_4',
    name: 'Dudu Silly Winking Bear',
    category: 'bubu_dudu',
    image: 'dudu_4.png',
    radius: 40,
    knotOffset: -40,
    stringColor: { base: '#92400E', highlight: '#FDE68A' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.44,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 130;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_dudu_pair_1: {
    id: 'bubu_dudu_pair_1',
    name: 'Bubu & Dudu Sweetheart Hug',
    category: 'bubu_dudu',
    image: 'bubu_dudu_pair_1.png',
    radius: 45,
    knotOffset: -42,
    stringColor: { base: '#F43F5E', highlight: '#FDA4AF' },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.46,
      angularTorque: 0.09,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 140;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_dudu_pair_2: {
    id: 'bubu_dudu_pair_2',
    name: 'Bubu & Dudu Cuddle Duo',
    category: 'bubu_dudu',
    image: 'bubu_dudu_pair_2.png',
    radius: 42,
    knotOffset: -40,
    stringColor: { base: '#FB7185', highlight: '#FFE4E6' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.44,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_dudu_pair_3: {
    id: 'bubu_dudu_pair_3',
    name: 'Bubu & Dudu Teatime Fun',
    category: 'bubu_dudu',
    image: 'bubu_dudu_pair_3.png',
    radius: 42,
    knotOffset: -40,
    stringColor: { base: '#F59E0B', highlight: '#FDE68A' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.44,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.0
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 135;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_dudu_pair_4: {
    id: 'bubu_dudu_pair_4',
    name: 'Bubu & Dudu Beach Adventure',
    category: 'bubu_dudu',
    image: 'bubu_dudu_pair_4.png',
    radius: 42,
    knotOffset: -45,
    stringColor: { base: '#06B6D4', highlight: '#A5F3FC' },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.46,
      angularTorque: 0.09,
      catchSpeedThreshold: 7.3
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 140;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_dudu_pair_5: {
    id: 'bubu_dudu_pair_5',
    name: 'Bubu & Dudu Straw Hat Trip',
    category: 'bubu_dudu',
    image: 'bubu_dudu_pair_5.png',
    radius: 45,
    knotOffset: -42,
    stringColor: { base: '#EAB308', highlight: '#FEF08A' },
    reluctance: {
      enabled: true,
      triggerRadius: 185,
      maxForce: 0.44,
      angularTorque: 0.08,
      catchSpeedThreshold: 7.1
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 140;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  },
  bubu_dudu_pair_6: {
    id: 'bubu_dudu_pair_6',
    name: 'Bubu & Dudu Forever Friends',
    category: 'bubu_dudu',
    image: 'bubu_dudu_pair_6.png',
    radius: 45,
    knotOffset: -42,
    stringColor: { base: '#F43F5E', highlight: '#FDA4AF' },
    reluctance: {
      enabled: true,
      triggerRadius: 190,
      maxForce: 0.46,
      angularTorque: 0.09,
      catchSpeedThreshold: 7.2
    },
    renderCustom: (ctx, charm, img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const h = 140;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
  }
};

