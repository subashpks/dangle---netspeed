// Charm registry defining physics, dimensions, knot offsets, and ritual shaders
const CHARMS = {
  nimbu: {
    id: 'nimbu',
    name: 'Nimbu Mirchi',
    culture: 'Indian',
    radius: 42,
    initialY: 200,
    density: 0.016,
    restitution: 0.45,
    // Connect cord snugly at the top pierced chilli
    knotOffset: -54,
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
    renderCustom: (ctx, charm, img, state, extraAssets) => {
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
        // 3 TIGHTLY DECKED CHILLIES: reduced gap between tiers
        const decks = [
          { y: -48, w: 72, rot: -0.09, flip: false },  // Tier 1 (top): tilted left
          { y: -30, w: 75, rot: 0.07, flip: true },    // Tier 2 (middle): tilted right, flipped
          { y: -12, w: 72, rot: -0.05, flip: false }   // Tier 3 (bottom): right above lemon
        ];

        // Soft drop shadow for chillies and lemon
        ctx.shadowColor = 'rgba(20, 15, 5, 0.38)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1.5;
        ctx.shadowOffsetY = 3.5;

        // Draw the 3 decked chillies
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
        });

        // Draw vertical jute thread segment passing through chillies into lemon
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#b08233';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(0, -54);
        ctx.lineTo(0, 12);
        ctx.stroke();
        ctx.restore();

        // Draw smaller, well-proportioned Lemon at the base
        ctx.save();
        const lemonW = 48; // Reduced from 68px to 48px
        const lemonH = (lemonW * 393) / 400; // ~47px
        const lemonY = 16;
        ctx.drawImage(lemonImg, -lemonW / 2, lemonY - lemonH / 2, lemonW, lemonH);
        ctx.restore();

        // Small organic knot dot underneath the lemon where thread is tied
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 38, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#654316';
        ctx.fill();
        ctx.restore();

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
      triggerRadius: 175,    // Distance at which repulsion starts
      maxForce: 0.0038,      // Smooth, organic evasion force
      angularTorque: 0.0006  // Slight defensive tilt
    },
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

      // 2. Draw mask with selected finish
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
    knotOffset: -46,
    drawW: 110,
    drawH: (110 * 270) / 240,
    yOffset: 8,
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
    renderCustom: (ctx, charm, img, state) => {
      // Draw base Daruma doll
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
    // Connect cord at the top of the 3-bead stack
    knotOffset: -94,
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
    renderCustom: (ctx, charm, img, state, extraAssets) => {
      const beadImg = extraAssets?.beads;

      // 1. Draw 3 Tiered Evil Eye Cube Beads stacked on the thread
      if (beadImg && beadImg.complete && beadImg.naturalWidth > 0) {
        const beadTiers = [
          { y: -84, size: 18, rot: 0 },       // Top bead (ties to main cord at -94)
          { y: -64, size: 19, rot: 0.12 },    // Middle bead (slight artisanal tilt)
          { y: -44, size: 18, rot: -0.08 }    // Bottom bead (sits right above disc eyelet at -34)
        ];

        // Lightweight, performant shadow for beads (low blur avoids GPU composition stalls)
        ctx.save();
        ctx.shadowColor = 'rgba(10, 15, 40, 0.35)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1.2;
        ctx.shadowOffsetY = 2.5;

        beadTiers.forEach(tier => {
          ctx.save();
          ctx.translate(0, tier.y);
          if (tier.rot) ctx.rotate(tier.rot);
          ctx.drawImage(beadImg, -tier.size / 2, -tier.size / 2, tier.size, tier.size);
          ctx.restore();
        });
        ctx.restore();
      }

      // 2. Thread segment passing through the 3 beads into the glass disc eyelet
      ctx.save();
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, -94);
      ctx.lineTo(0, -28);
      ctx.stroke();
      ctx.restore();

      // 3. Draw Smaller, Delicate Main Glass Evil Eye Disc Badge
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        const w = 64; // Reduced by ~33% for delicate, balanced talisman proportion
        const h = (w * 703) / 680; // ~66px
        const discY = 4; // Eyelet loop sits around y = -28px

        // Crisp, fast drop shadow (avoids 10px heavy blur that causes window composition lag)
        ctx.shadowColor = 'rgba(10, 20, 50, 0.40)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4.5;

        ctx.drawImage(img, -w / 2, discY - h / 2, w, h);
        ctx.restore();
      }
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
          { attachX: 0,   attachY: 42, dropLen: 38, w: 26, h: (26 * 300) / 148, stiffness: 0.09, damping: 0.88, restAngle: 0 },
          { attachX: 24,  attachY: 36, dropLen: 26, w: 22, h: (22 * 300) / 148, stiffness: 0.12, damping: 0.86, restAngle: 0.06 }
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
  }
};
