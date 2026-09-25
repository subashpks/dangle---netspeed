import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

const {
  Engine,
  Bodies,
  Body,
  Constraint,
  Composite,
  Composites,
  Events
} = Matter;

export default function LiveDangleOverlay({ activeCharm, onSwitchCharm, isZenMode = false }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const charmBodyRef = useRef(null);
  const chainRef = useRef(null);
  const anchorRef = useRef(null);
  const imageCacheRef = useRef({});

  const mouseStateRef = useRef({
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    time: 0,
    velX: 0,
    velY: 0,
    isDown: false,
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });

  const stringsStateRef = useRef([
    { angle: 0, vel: 0, bowX: 0 },
    { angle: 0, vel: 0, bowX: 0 },
    { angle: 0, vel: 0, bowX: 0 }
  ]);

  const [isNearCharm, setIsNearCharm] = useState(false);

  // Dynamic Anchor X based on Zen mode (centered in Zen mode, top-right in browsing mode)
  const getAnchorX = (w) => {
    if (isZenMode) return w / 2;
    if (w < 768) return w / 2; // on mobile, center naturally
    return Math.max(160, w - 240);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const DPR = window.devicePixelRatio || 2;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (anchorRef.current) {
        const newStartX = getAnchorX(width);
        Body.setPosition(anchorRef.current, { x: newStartX, y: 0 });
      }
    };

    resizeCanvas();
    const ctx = canvas.getContext('2d');

    // 1. Create Engine
    const engine = Engine.create({ enableSleeping: false });
    engine.gravity.y = 1.0;
    engineRef.current = engine;

    // 2. Chain and Anchor setup
    const isMulti = !!activeCharm.isMultiNode && Array.isArray(activeCharm.nodes) && activeCharm.nodes.length > 0;
    const startX = getAnchorX(width);
    const startY = 0;
    const linkCount = isMulti ? 3 : 5;
    const linkWidth = 3.2;
    const linkHeight = 22;
    const gap = 2;

    const anchor = Bodies.circle(startX, startY, 4, {
      isStatic: true,
      render: { visible: false }
    });
    anchorRef.current = anchor;

    const chainGroup = Body.nextGroup(true);

    const chain = Composites.stack(startX - linkWidth / 2, startY + 4, 1, linkCount, 0, gap, (x, y) => {
      return Bodies.rectangle(x, y, linkWidth, linkHeight, {
        collisionFilter: { group: chainGroup },
        density: 0.007,
        frictionAir: 0.038
      });
    });
    chainRef.current = chain;

    Composites.chain(chain, 0, 0.45, 0, -0.45, {
      stiffness: 0.48,
      length: 3.5,
      damping: 0.18
    });

    const firstLink = chain.bodies[0];
    const topPin = Constraint.create({
      bodyA: anchor,
      bodyB: firstLink,
      pointA: { x: 0, y: 0 },
      pointB: { x: 0, y: -linkHeight / 2 },
      stiffness: 0.65,
      length: 2,
      damping: 0.18
    });

    // 3. Charm Body or Multi-Node Chain Bodies
    const nodeBodies = [];
    const nodeConstraints = [];
    let mainDraggableBody = null;

    if (isMulti) {
      // Build tightly nested multi-node garland chain (Padigaram -> Chilli -> Elumichai -> Finger)
      let prevBody = chain.bodies[linkCount - 1];
      let currentY = prevBody.position.y + linkHeight / 2;

      // Close-knit joint offsets for contiguous nested talisman garland (no unnatural gaps)
      const jointOffsets = [
        { ptA: { x: 0, y: linkHeight / 2 }, ptB: { x: 0, y: -18 }, drop: 18, stiffness: 0.85, damping: 0.12 }, // Chain -> Padigaram
        { ptA: { x: 0, y: 14 }, ptB: { x: 0, y: -8 }, drop: 18, stiffness: 0.72, damping: 0.08 },             // Padigaram -> Chilli
        { ptA: { x: 0, y: 8 }, ptB: { x: 0, y: -26 }, drop: 28, stiffness: 0.68, damping: 0.07 },              // Chilli -> Lemon
        { ptA: { x: 0, y: 22 }, ptB: { x: 0, y: -10 }, drop: 28, stiffness: 0.65, damping: 0.06 }             // Lemon -> Finger
      ];

      activeCharm.nodes.forEach((node, idx) => {
        const nRadius = node.radius || 28;
        const jConf = jointOffsets[idx] || { ptA: { x: 0, y: 15 }, ptB: { x: 0, y: -15 }, drop: 25, stiffness: 0.70, damping: 0.08 };
        currentY += jConf.drop;

        // Subtle alternating natural rest angle so elements aren't a rigid computer line
        const naturalSplay = idx === 1 ? 0.04 : idx === 2 ? -0.03 : idx === 3 ? 0.05 : 0;

        const nBody = Bodies.circle(startX + naturalSplay * 15, currentY, nRadius, {
          collisionFilter: { group: chainGroup },
          density: node.density || 0.016,
          frictionAir: 0.018, // Lower air friction to allow lively individual sway
          restitution: 0.32
        });

        const pin = Constraint.create({
          bodyA: prevBody,
          bodyB: nBody,
          pointA: jConf.ptA,
          pointB: jConf.ptB,
          stiffness: jConf.stiffness || 0.72,
          length: 0.5,
          damping: jConf.damping || 0.08
        });

        nodeBodies.push({ body: nBody, config: node });
        nodeConstraints.push(pin);
        prevBody = nBody;
      });

      charmBodyRef.current = nodeBodies[nodeBodies.length - 1].body; // Bottom body acts as primary draggable
      mainDraggableBody = charmBodyRef.current;

      const allNodeBodies = nodeBodies.map((n) => n.body);
      Composite.add(engine.world, [anchor, chain, topPin, ...allNodeBodies, ...nodeConstraints]);

      // Initial natural impulse for fluid individual ripple
      Body.applyForce(allNodeBodies[0], allNodeBodies[0].position, { x: 0.014, y: 0 });
      if (allNodeBodies[1]) Body.applyForce(allNodeBodies[1], allNodeBodies[1].position, { x: -0.010, y: 0 });
      if (allNodeBodies[2]) Body.applyForce(allNodeBodies[2], allNodeBodies[2].position, { x: 0.018, y: 0 });
      Body.applyForce(allNodeBodies[allNodeBodies.length - 1], allNodeBodies[allNodeBodies.length - 1].position, { x: -0.015, y: 0 });
    } else {
      const lastLink = chain.bodies[linkCount - 1];
      const charmRadius = 52;
      const knotOffset = -75;

      const charmBody = Bodies.circle(startX, lastLink.position.y + linkHeight / 2 + Math.abs(knotOffset), charmRadius, {
        collisionFilter: { group: chainGroup },
        density: 0.016,
        frictionAir: 0.032,
        restitution: 0.4
      });
      charmBodyRef.current = charmBody;
      mainDraggableBody = charmBody;

      const charmPin = Constraint.create({
        bodyA: lastLink,
        bodyB: charmBody,
        pointA: { x: 0, y: linkHeight / 2 },
        pointB: { x: 0, y: knotOffset },
        stiffness: 0.58,
        length: 3,
        damping: 0.16
      });

      Composite.add(engine.world, [anchor, chain, topPin, charmBody, charmPin]);

      // Initial natural impulse
      Body.applyForce(charmBody, charmBody.position, { x: 0.018, y: 0 });
    }

    // 4. Image Preloading with Natural Aspect Ratio
    const loadImg = (src) => {
      if (imageCacheRef.current[src]) return imageCacheRef.current[src];
      const img = new Image();
      img.src = src;
      imageCacheRef.current[src] = img;
      return img;
    };

    loadImg(activeCharm.image);
    if (isMulti) {
      activeCharm.nodes.forEach((n) => loadImg(n.image));
    }

    // 5. Physics & Render Loop
    let animId;
    let tick = 0;

    const renderLoop = () => {
      tick += 0.016;

      const m = mouseStateRef.current;
      const activePhysBody = charmBodyRef.current;
      if (!activePhysBody) return;

      const charmPos = activePhysBody.position;

      // Cursor Reluctance ("Shyness") Physics Hook: Applied independently to EACH element
      if (m.x > 0 && !m.isDragging) {
        if (isMulti) {
          // Each node in the talisman dodges and twists on its own when cursor gets near it
          nodeBodies.forEach(({ body: nb, config: nConf }, idx) => {
            const nbPos = nb.position;
            const dist = Math.hypot(m.x - nbPos.x, m.y - nbPos.y);
            const triggerRadius = 160;

            if (dist < triggerRadius && dist > 0) {
              const forceFactor = Math.pow(1 - dist / triggerRadius, 1.4) * 0.45;
              const evadeX = (nbPos.x - m.x) / dist;
              const evadeY = (nbPos.y - m.y) / dist;

              // Independent lateral evasion force on this specific node
              Body.applyForce(nb, nbPos, {
                x: evadeX * forceFactor * 0.0038,
                y: evadeY * forceFactor * 0.0016
              });

              // Individual dynamic tilt torque (organic splay)
              const torqueDir = evadeX > 0 ? 1 : -1;
              const torque = torqueDir * forceFactor * (0.0045 + idx * 0.0015);
              Body.setAngularVelocity(nb, nb.angularVelocity + torque);
            }

            // Continuous natural atmospheric organic flutter
            const nodeWind = Math.sin(tick * 1.8 + idx * 1.4) * 0.00014 + Math.cos(tick * 2.6 + idx * 1.1) * 0.00008;
            Body.applyForce(nb, nbPos, { x: nodeWind, y: 0 });
          });
        } else {
          // Standard single charm shyness
          const dist = Math.hypot(m.x - charmPos.x, m.y - charmPos.y);
          const triggerRadius = 180;

          if (dist < triggerRadius && dist > 0) {
            const forceFactor = Math.pow(1 - dist / triggerRadius, 1.4) * 0.38;
            const evadeX = (charmPos.x - m.x) / dist;
            const evadeY = (charmPos.y - m.y) / dist;

            Body.applyForce(activePhysBody, charmPos, {
              x: evadeX * forceFactor * 0.0035,
              y: evadeY * forceFactor * 0.0018
            });

            const torque = (evadeX > 0 ? 0.003 : -0.003) * forceFactor;
            Body.setAngularVelocity(activePhysBody, activePhysBody.angularVelocity + torque);
          }
        }
      }

      // Drag Physics
      if (m.isDragging && m.draggedBody) {
        const targetX = m.x - m.dragOffset.x;
        const targetY = m.y - m.dragOffset.y;
        const dx = targetX - m.draggedBody.position.x;
        const dy = targetY - m.draggedBody.position.y;
        Body.setVelocity(m.draggedBody, { x: dx * 0.35, y: dy * 0.35 });
      } else if (!isMulti) {
        // Atmospheric Wind Waves for single charm
        const wind = Math.sin(tick * 1.6) * 0.00015 + Math.cos(tick * 2.8) * 0.00008;
        Body.applyForce(activePhysBody, charmPos, { x: wind, y: 0 });
      }

      Engine.update(engine, 1000 / 60);

      // Render onto Full-Screen Canvas
      ctx.save();
      ctx.scale(DPR, DPR);
      ctx.clearRect(0, 0, width, height);

      const anchorPos = anchor.position;

      // 1. Draw Top Menubar Mounting Bail (Gold Cap)
      ctx.save();
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.roundRect(anchorPos.x - 20, 0, 40, 8, [0, 0, 4, 4]);
      ctx.fill();
      ctx.shadowColor = 'rgba(212, 175, 55, 0.45)';
      ctx.shadowBlur = 8;
      ctx.restore();

      // 2. Draw Top Main Cord with Silk Highlights
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(anchorPos.x, 0);

      chain.bodies.forEach((link) => {
        ctx.lineTo(link.position.x, link.position.y);
      });

      if (!isMulti) {
        const charmAngle = activePhysBody.angle;
        const knotWorldX = charmPos.x + Math.sin(charmAngle) * -75;
        const knotWorldY = charmPos.y - Math.cos(charmAngle) * -75;
        ctx.lineTo(knotWorldX, knotWorldY);
      }

      // Base Cord
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.stroke();

      // Silk Twist Highlight
      ctx.strokeStyle = '#7A121D';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.restore();

      // 3. RENDER CHARM(S)
      if (isMulti) {
        // Render top connecting string segment only (from chain to top node)
        ctx.save();
        ctx.beginPath();
        const lastLinkPos = chain.bodies[chain.bodies.length - 1].position;
        const firstNodePos = nodeBodies[0].body.position;
        ctx.moveTo(lastLinkPos.x, lastLinkPos.y);
        ctx.lineTo(firstNodePos.x, firstNodePos.y - 10);
        ctx.strokeStyle = '#2b261b';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.restore();

        // Render each node element individually with crisp physics & layered depth
        nodeBodies.forEach(({ body: nBody, config: nodeConf }, idx) => {
          const nPos = nBody.position;
          const nAngle = nBody.angle;

          // Draw individual element image with realistic shadow & rotation
          const nImg = imageCacheRef.current[nodeConf.image];
          if (nImg && nImg.complete && nImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(nPos.x, nPos.y);
            ctx.rotate(nAngle);

            const drawW = nodeConf.width || 80;
            const drawH = nodeConf.height || 60;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 5;
            ctx.shadowOffsetX = 1;

            ctx.drawImage(nImg, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
          }

          // Top knot bead for first node only
          if (idx === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(nPos.x, nPos.y - (nodeConf.height || 60) * 0.42, 3.8, 0, Math.PI * 2);
            ctx.fillStyle = '#dfba6c';
            ctx.fill();
            ctx.strokeStyle = '#8f6522';
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.restore();
          }
        });

        // Add trailing threads beneath bottom element (Finger)
        const lastBodyObj = nodeBodies[nodeBodies.length - 1];
        if (lastBodyObj) {
          const attachYOffset = 18; // Tightly anchored directly on bottom contour of finger
          const stringConfigs = [
            { attachX: -12, attachY: attachYOffset, dropLen: 42, stiffness: 0.12, damping: 0.86, restAngle: -0.10, base: '#b08233', highlight: '#e2be68', tipColor: '#8f6522' },
            { attachX: 0, attachY: attachYOffset + 2, dropLen: 48, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#222222', highlight: '#555555', tipColor: '#b08233' },
            { attachX: 12, attachY: attachYOffset, dropLen: 44, stiffness: 0.12, damping: 0.86, restAngle: 0.10, base: '#b08233', highlight: '#e2be68', tipColor: '#8f6522' }
          ];
          drawTrailingStrings(ctx, lastBodyObj.body, stringsStateRef.current, stringConfigs, m, tick);
        }
      } else {
        // Standard Single Charm Render
        const knotWorldX = charmPos.x + Math.sin(activePhysBody.angle) * -75;
        const knotWorldY = charmPos.y - Math.cos(activePhysBody.angle) * -75;

        ctx.save();
        ctx.translate(knotWorldX, knotWorldY);
        ctx.rotate(activePhysBody.angle);
        ctx.beginPath();
        ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#F3E5AB';
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        const img = imageCacheRef.current[activeCharm.image];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.translate(charmPos.x, charmPos.y);
          ctx.rotate(activePhysBody.angle);

          const targetH = 150;
          const aspect = img.naturalWidth / img.naturalHeight;
          const targetW = targetH * aspect;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 10;
          ctx.shadowOffsetX = 3;

          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();

          const bottomY = targetH / 2 - 4;
          const stringConfigs = [
            { attachX: -5, attachY: bottomY, dropLen: 42, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#D4AF37', highlight: '#F3E5AB', tipColor: '#7A121D' },
            { attachX: 0, attachY: bottomY + 2, dropLen: 48, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#7A121D', highlight: '#D4AF37', tipColor: '#D4AF37' },
            { attachX: 5, attachY: bottomY, dropLen: 44, stiffness: 0.12, damping: 0.86, restAngle: 0.06, base: '#D4AF37', highlight: '#F3E5AB', tipColor: '#7A121D' }
          ];

          drawTrailingStrings(ctx, activePhysBody, stringsStateRef.current, stringConfigs, m, tick);
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // 6. Global Window Mouse & Pointer Event Listeners
    const handlePointerMove = (e) => {
      const now = performance.now();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      const m = mouseStateRef.current;
      if (m.time > 0) {
        const dt = Math.max(1, now - m.time);
        const vx = ((clientX - m.prevX) / dt) * 16.67;
        const vy = ((clientY - m.prevY) / dt) * 16.67;
        m.velX = m.velX * 0.4 + vx * 0.6;
        m.velY = m.velY * 0.4 + vy * 0.6;
      }
      m.prevX = clientX;
      m.prevY = clientY;
      m.time = now;
      m.x = clientX;
      m.y = clientY;

      // Detect proximity to any charm body or chain
      let near = false;
      const bodiesToCheck = isMulti ? nodeBodies.map((nb) => nb.body) : [charmBodyRef.current];
      for (const b of bodiesToCheck) {
        if (b && Math.hypot(clientX - b.position.x, clientY - b.position.y) < 130) {
          near = true;
          break;
        }
      }
      setIsNearCharm(near);
    };

    const handlePointerDown = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      const bodiesToCheck = isMulti ? nodeBodies.map((nb) => nb.body) : [charmBodyRef.current];
      for (const b of bodiesToCheck) {
        if (!b) continue;
        const dist = Math.hypot(clientX - b.position.x, clientY - b.position.y);
        if (dist < (b.circleRadius || 50) + 30 || (Math.abs(clientX - anchor.position.x) < 35 && clientY < b.position.y)) {
          const m = mouseStateRef.current;
          m.isDown = true;
          m.isDragging = true;
          m.draggedBody = b;
          m.dragOffset = {
            x: clientX - b.position.x,
            y: clientY - b.position.y
          };
          e.preventDefault();
          break;
        }
      }
    };

    const handlePointerUp = () => {
      const m = mouseStateRef.current;
      if (m.isDragging && m.draggedBody) {
        Body.setVelocity(m.draggedBody, {
          x: Math.min(18, Math.max(-18, m.velX * 0.45)),
          y: Math.min(14, Math.max(-14, m.velY * 0.45))
        });
        m.isDragging = false;
        m.isDown = false;
        m.draggedBody = null;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
      Events.off(engine);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [activeCharm, isZenMode]);

  return (
    <div
      className="fullscreen-dangle-viewport"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: isNearCharm ? 'auto' : 'none',
        zIndex: 90
      }}
    >
      <canvas
        ref={canvasRef}
        className="fullscreen-dangle-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: isNearCharm ? 'grab' : 'default'
        }}
      />
    </div>
  );
}

// Zero-Gravity Trailing String Physics Function (from charms.js)
function drawTrailingStrings(ctx, charm, stringsState, stringConfigs, mousePos, tick) {
  if (!stringsState || !stringConfigs) return;

  const charmAngVel = charm.angularVelocity || 0;
  const charmVelX = charm.velocity ? charm.velocity.x : 0;
  const targetLag = -charmAngVel * 7.5 - charmVelX * 0.038;
  const stringBowTarget = -charmVelX * 1.6 - charmAngVel * 38;

  const t = tick * 2.5;
  const charmAngle = charm.angle || 0;
  const cosA = Math.cos(charmAngle);
  const sinA = Math.sin(charmAngle);

  stringConfigs.forEach((cfg, idx) => {
    const s = stringsState[idx];
    if (!s) return;

    // Harmonic wind waves
    const windHarmonic1 = Math.sin(t * 1.7 + idx * 1.4) * 0.22;
    const windHarmonic2 = Math.cos(t * 3.1 + idx * 2.2) * 0.12;
    const windLift = Math.sin(t * 2.0 + idx * 1.6) * 0.18 + 0.12;

    const baseTarget = cfg.restAngle + targetLag + windHarmonic1 + windHarmonic2;
    const springForce = (baseTarget - s.angle) * (cfg.stiffness || 0.11);
    s.vel = (s.vel + springForce) * (cfg.damping || 0.86);
    s.angle += s.vel;
    s.bowX += (stringBowTarget - s.bowX) * 0.15;

    // Mouse evasion on string tips
    let mouseEvadeX = 0;
    let mouseEvadeY = 0;
    if (mousePos && mousePos.x > 0 && !mousePos.isDragging) {
      const rootScreenX = charm.position.x + cosA * cfg.attachX - sinA * cfg.attachY;
      const rootScreenY = charm.position.y + sinA * cfg.attachX + cosA * cfg.attachY;
      const mDist = Math.hypot(mousePos.x - rootScreenX, mousePos.y - rootScreenY);

      if (mDist < 110 && mDist > 0) {
        const evadeFactor = Math.pow(1 - mDist / 110, 1.4) * 0.75;
        const mdx = (rootScreenX - mousePos.x) / mDist;
        const mdy = (rootScreenY - mousePos.y) / mDist;
        mouseEvadeX = (mdx * cosA + mdy * sinA) * evadeFactor * 30;
        mouseEvadeY = (-mdx * sinA + mdy * cosA) * evadeFactor * 20;
        s.angle += (mdx * cosA) * evadeFactor * 0.35;
      }
    }

    const startPt = { x: cfg.attachX, y: cfg.attachY };
    const effectiveDrop = cfg.dropLen * Math.max(0.45, 1.0 - windLift * 0.45);
    const endPt = {
      x: cfg.attachX + Math.sin(s.angle) * cfg.dropLen + mouseEvadeX,
      y: cfg.attachY + Math.cos(s.angle) * effectiveDrop + mouseEvadeY
    };

    const ctrl1 = {
      x: cfg.attachX + Math.sin(s.angle * 0.4) * (cfg.dropLen * 0.38) + s.bowX * 0.25,
      y: cfg.attachY + cfg.dropLen * 0.35
    };
    const ctrl2 = {
      x: (startPt.x + endPt.x) / 2 + s.bowX * 0.45 + Math.sin(t * 2.8 + idx) * 3.5,
      y: (startPt.y + endPt.y) / 2 + 1.2
    };

    ctx.save();
    ctx.translate(charm.position.x, charm.position.y);
    ctx.rotate(charmAngle);

    // Base string
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, endPt.x, endPt.y);
    ctx.strokeStyle = cfg.base || '#D4AF37';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 3;
    ctx.stroke();

    // Highlight twist
    if (cfg.highlight) {
      ctx.strokeStyle = cfg.highlight;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
    }

    // Tip accent bead
    if (cfg.tipColor) {
      ctx.beginPath();
      ctx.arc(endPt.x, endPt.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = cfg.tipColor;
      ctx.fill();
    }
    ctx.restore();
  });
}
