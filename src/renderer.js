const Matter = typeof window !== 'undefined' && window.Matter ? window.Matter : require('matter-js');

const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Constraint,
  Composite,
  Composites,
  Mouse,
  MouseConstraint,
  Events
} = Matter;

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 650;
const DPR = window.devicePixelRatio || 2;

// Get DOM elements
const canvas = document.getElementById('physics-canvas');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let render = null;

// High-DPI Retina canvas setup
function updateCanvasDimensions() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth * DPR;
  canvas.height = canvasHeight * DPR;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  if (render) {
    render.canvas.width = canvasWidth * DPR;
    render.canvas.height = canvasHeight * DPR;
    render.options.width = canvasWidth * DPR;
    render.options.height = canvasHeight * DPR;
  }
}

updateCanvasDimensions();

// 1. Create Engine with soft realistic gravity & high air resistance
const engine = Engine.create({ enableSleeping: false });
engine.gravity.y = 1.0;

// 2. Create Custom Renderer
render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvasWidth * DPR,
    height: canvasHeight * DPR,
    wireframes: false,
    background: 'transparent'
  }
});

Render.run(render);

// 3. Create Runner
const runner = Runner.create();
Runner.run(runner, engine);

// 4. Stable 5-Segment Pliable Organic Cord (Organic Slack & Bowing)
let startX = Math.round(canvasWidth - 280);
const startY = 0;
const linkCount = 5;
const linkWidth = 3.5;
const linkHeight = 22;
const gap = 2;

let anchor = Bodies.circle(startX, startY, 4, {
  isStatic: true,
  render: { visible: false }
});

const chainGroup = Body.nextGroup(true);

let chain = Composites.stack(startX - linkWidth / 2, startY + 4, 1, linkCount, 0, gap, (x, y) => {
  return Bodies.rectangle(x, y, linkWidth, linkHeight, {
    collisionFilter: { group: chainGroup },
    density: 0.007,
    frictionAir: 0.038,
    render: { visible: false }
  });
});

// Pliable chain connection with gentle slack (stiffness 0.48, length 3.5)
Composites.chain(chain, 0, 0.45, 0, -0.45, {
  stiffness: 0.48,
  length: 3.5,
  damping: 0.18,
  render: { visible: false }
});

let firstLink = chain.bodies[0];
let topPin = Constraint.create({
  bodyA: anchor,
  bodyB: firstLink,
  pointA: { x: 0, y: 0 },
  pointB: { x: 0, y: -linkHeight / 2 },
  stiffness: 0.65,
  length: 2,
  damping: 0.18,
  render: { visible: false }
});

Composite.add(engine.world, [anchor, chain, topPin]);

// 5. Dynamic Multi-Charm Management
let currentCharmId = 'nimbu';
let charmBody = null;
let charmPin = null;
let appState = {
  activeCharm: 'nimbu',
  nimbuHungTime: Date.now(),
  drishtiPalette: 'crimson',
  darumaState: 0
};

// Preloaded images dictionary
const charmImages = {};
const extraAssetImages = {};

function getCharmImage(charmDef) {
  const uri = charmDef.dataUri || charmDef.image;
  if (!uri) return null;
  if (!charmImages[charmDef.id]) {
    const img = new Image();
    img.src = uri;
    charmImages[charmDef.id] = img;
  }
  return charmImages[charmDef.id];
}

function getCharmExtraAssets(charmDef) {
  const assets = {};
  if (charmDef.beadsUri) {
    if (!extraAssetImages[charmDef.id + '_beads']) {
      const img = new Image();
      img.src = charmDef.beadsUri;
      extraAssetImages[charmDef.id + '_beads'] = img;
    }
    assets.beads = extraAssetImages[charmDef.id + '_beads'];
  }
  if (charmDef.lemonUri) {
    if (!extraAssetImages[charmDef.id + '_lemon']) {
      const img = new Image();
      img.src = charmDef.lemonUri;
      extraAssetImages[charmDef.id + '_lemon'] = img;
    }
    assets.lemon = extraAssetImages[charmDef.id + '_lemon'];
  }
  if (charmDef.chilliUri) {
    if (!extraAssetImages[charmDef.id + '_chilli']) {
      const img = new Image();
      img.src = charmDef.chilliUri;
      extraAssetImages[charmDef.id + '_chilli'] = img;
    }
    assets.chilli = extraAssetImages[charmDef.id + '_chilli'];
  }
  if (charmDef.hoopUri) {
    if (!extraAssetImages[charmDef.id + '_hoop']) {
      const img = new Image();
      img.src = charmDef.hoopUri;
      extraAssetImages[charmDef.id + '_hoop'] = img;
    }
    assets.hoop = extraAssetImages[charmDef.id + '_hoop'];
  }
  if (charmDef.featherUri) {
    if (!extraAssetImages[charmDef.id + '_feather']) {
      const img = new Image();
      img.src = charmDef.featherUri;
      extraAssetImages[charmDef.id + '_feather'] = img;
    }
    assets.feather = extraAssetImages[charmDef.id + '_feather'];
  }
  return assets;
}

let nodeBodies = [];
let nodeConstraints = [];

function attachCharm(charmId) {
  const charmDef = CHARMS[charmId] || CHARMS.nimbu;
  currentCharmId = charmDef.id;

  // Clean up previous charm
  if (charmBody && charmPin) {
    Composite.remove(engine.world, [charmBody, charmPin]);
  }
  if (nodeBodies.length > 0) {
    Composite.remove(engine.world, [...nodeBodies.map(n => n.body), ...nodeConstraints]);
    nodeBodies = [];
    nodeConstraints = [];
  }

  const lastLink = chain.bodies[chain.bodies.length - 1];

  if (charmDef.isMultiNode && Array.isArray(charmDef.nodes) && charmDef.nodes.length > 0) {
    let prevBody = lastLink;
    let currentY = lastLink.position.y + linkHeight / 2;

    const jointOffsets = [
      { ptA: { x: 0, y: linkHeight / 2 }, ptB: { x: 0, y: -18 }, drop: 18, stiffness: 0.85, damping: 0.12 },
      { ptA: { x: 0, y: 14 }, ptB: { x: 0, y: -8 }, drop: 18, stiffness: 0.72, damping: 0.08 },
      { ptA: { x: 0, y: 8 }, ptB: { x: 0, y: -26 }, drop: 28, stiffness: 0.68, damping: 0.07 },
      { ptA: { x: 0, y: 22 }, ptB: { x: 0, y: -10 }, drop: 28, stiffness: 0.65, damping: 0.06 }
    ];

    charmDef.nodes.forEach((node, idx) => {
      const nRadius = node.radius || 28;
      const jConf = jointOffsets[idx] || { ptA: { x: 0, y: 15 }, ptB: { x: 0, y: -15 }, drop: 25, stiffness: 0.70, damping: 0.08 };
      currentY += jConf.drop;

      const naturalSplay = idx === 1 ? 0.04 : idx === 2 ? -0.03 : idx === 3 ? 0.05 : 0;

      const nBody = Bodies.circle(startX + naturalSplay * 15, currentY, nRadius, {
        collisionFilter: { group: chainGroup },
        density: node.density || 0.016,
        frictionAir: 0.018,
        restitution: 0.32,
        render: { visible: false }
      });

      const pin = Constraint.create({
        bodyA: prevBody,
        bodyB: nBody,
        pointA: jConf.ptA,
        pointB: jConf.ptB,
        stiffness: jConf.stiffness || 0.72,
        length: 0.5,
        damping: jConf.damping || 0.08,
        render: { visible: false }
      });

      nodeBodies.push({ body: nBody, config: node });
      nodeConstraints.push(pin);
      prevBody = nBody;
    });

    charmBody = nodeBodies[nodeBodies.length - 1].body;
    charmPin = null;

    const allNodeBodies = nodeBodies.map(n => n.body);
    Composite.add(engine.world, [...allNodeBodies, ...nodeConstraints]);

    Body.applyForce(allNodeBodies[0], allNodeBodies[0].position, { x: 0.014, y: 0 });
    if (allNodeBodies[1]) Body.applyForce(allNodeBodies[1], allNodeBodies[1].position, { x: -0.010, y: 0 });
    if (allNodeBodies[2]) Body.applyForce(allNodeBodies[2], allNodeBodies[2].position, { x: 0.018, y: 0 });
    Body.applyForce(allNodeBodies[allNodeBodies.length - 1], allNodeBodies[allNodeBodies.length - 1].position, { x: -0.015, y: 0 });
  } else {
    const radius = charmDef.radius || 42;
    const knotOffset = charmDef.knotOffset !== undefined ? charmDef.knotOffset : -45;
    const density = charmDef.density || 0.018;
    const restitution = charmDef.restitution !== undefined ? charmDef.restitution : 0.38;
    const attachY = lastLink.position.y + linkHeight / 2 + Math.abs(knotOffset);

    charmBody = Bodies.circle(lastLink.position.x, attachY, radius, {
      collisionFilter: { group: chainGroup },
      density: density,
      frictionAir: 0.032,
      restitution: restitution,
      render: { visible: false }
    });

    charmPin = Constraint.create({
      bodyA: lastLink,
      bodyB: charmBody,
      pointA: { x: 0, y: linkHeight / 2 },
      pointB: { x: 0, y: knotOffset },
      stiffness: 0.58,
      length: 3,
      damping: 0.16,
      render: { visible: false }
    });

    Composite.add(engine.world, [charmBody, charmPin]);
  }

  getCharmImage(charmDef);
  getCharmExtraAssets(charmDef);
  if (charmDef.isMultiNode && Array.isArray(charmDef.nodes)) {
    charmDef.nodes.forEach(n => {
      getCharmImage({ id: n.id, dataUri: n.image });
    });
  }
}

function setAnchorX(newX) {
  if (typeof newX !== 'number' || isNaN(newX)) return;
  startX = newX;
  Body.setPosition(anchor, { x: startX, y: startY });

  // Re-align chain links smoothly
  for (let i = 0; i < chain.bodies.length; i++) {
    const b = chain.bodies[i];
    Body.setPosition(b, { x: startX, y: startY + 4 + i * (linkHeight + gap) });
    Body.setVelocity(b, { x: 0, y: 0 });
  }

  if (charmBody) {
    const charmDef = CHARMS[currentCharmId] || CHARMS.nimbu;
    const lastLink = chain.bodies[chain.bodies.length - 1];
    Body.setPosition(charmBody, {
      x: startX,
      y: lastLink.position.y + linkHeight / 2 + Math.abs(charmDef.knotOffset)
    });
    Body.setVelocity(charmBody, { x: 0, y: 0 });
  }
}

// Initialize default charm
attachCharm('nimbu');

window.addEventListener('resize', () => {
  updateCanvasDimensions();
});

// Load stored state if available
if (window.electronAPI && window.electronAPI.getState) {
  window.electronAPI.getState().then((saved) => {
    if (saved) {
      appState = { ...appState, ...saved };
      if (saved.activeCharm && saved.activeCharm !== currentCharmId) {
        attachCharm(saved.activeCharm);
      }
    }
  });
}

// 6. Mouse Interaction & Desktop Click-Through Hit-Testing
const mouse = Mouse.create(render.canvas);
Mouse.setScale(mouse, { x: 1 / DPR, y: 1 / DPR });

const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.28,
    damping: 0.12,
    render: { visible: false }
  }
});

Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

let isIgnoringMouse = false;
let isMouseDown = false;
let currentMousePos = { x: -9999, y: -9999, active: false };
let prevMousePos = { x: -9999, y: -9999, time: 0 };
let mouseVelocity = { x: 0, y: 0 };
let lastIpcCallTime = 0;
let caughtUntil = 0; // Timestamp until which charm evasion is suppressed after being caught

// Track mouse down / up across canvas and window to guarantee drag immunity
window.addEventListener('mousedown', () => {
  isMouseDown = true;
  if (isIgnoringMouse && window.electronAPI && window.electronAPI.setIgnoreMouseEvents) {
    isIgnoringMouse = false;
    window.electronAPI.setIgnoreMouseEvents(false);
  }
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

function updateMousePosition(mx, my) {
  const now = performance.now();
  if (prevMousePos.time > 0) {
    const dt = Math.max(1, now - prevMousePos.time);
    // Smooth exponential velocity filter
    const vx = ((mx - prevMousePos.x) / dt) * 16.67;
    const vy = ((my - prevMousePos.y) / dt) * 16.67;
    mouseVelocity.x = mouseVelocity.x * 0.4 + vx * 0.6;
    mouseVelocity.y = mouseVelocity.y * 0.4 + vy * 0.6;
  }
  prevMousePos.x = mx;
  prevMousePos.y = my;
  prevMousePos.time = now;

  currentMousePos.x = mx;
  currentMousePos.y = my;
  currentMousePos.active = true;

  if (!charmBody || !window.electronAPI || !window.electronAPI.setIgnoreMouseEvents) return;

  const bodiesToCheck = (charmDef?.isMultiNode && nodeBodies.length > 0) ? nodeBodies.map(n => n.body) : [charmBody];
  let isNearCharm = false;

  for (const b of bodiesToCheck) {
    if (!b) continue;
    const distToNode = Math.hypot(mx - b.position.x, my - b.position.y);
    const nodeR = b.circleRadius || charmR;
    if (distToNode <= Math.max(nodeR + 65, 120)) {
      isNearCharm = true;
      break;
    }
  }

  const bottomReach = Math.max(115, (charmDef?.drawH || 110) + 40);
  const isNearThread = my >= 0 && my <= charmBody.position.y + 20 && Math.abs(mx - startX) <= 45;
  const isInteracting = isMouseDown || !!mouseConstraint.body || (charmBody.speed > 1.5 && Math.hypot(mx - charmBody.position.x, my - charmBody.position.y) < 220);
  const shouldCapture = isInteracting || isNearCharm || isNearThread;

  if (shouldCapture && isIgnoringMouse) {
    isIgnoringMouse = false;
    lastIpcCallTime = now;
    window.electronAPI.setIgnoreMouseEvents(false);
  } else if (!shouldCapture && !isIgnoringMouse && now - lastIpcCallTime > 40) {
    isIgnoringMouse = true;
    lastIpcCallTime = now;
    window.electronAPI.setIgnoreMouseEvents(true, true);
  }
}

// 1. Local window mousemove listener
window.addEventListener('mousemove', (e) => {
  updateMousePosition(e.clientX, e.clientY);
});

// 2. Global screen cursor listener via Electron IPC
if (window.electronAPI && window.electronAPI.onCursorPos) {
  window.electronAPI.onCursorPos((pos) => {
    if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
      updateMousePosition(pos.x, pos.y);
    }
  });
}

window.addEventListener('mouseleave', () => {
  if (!isMouseDown) {
    setTimeout(() => {
      if (performance.now() - prevMousePos.time > 250) {
        currentMousePos.active = false;
      }
    }, 200);
  }
});

// Reluctance Physics Hook: Charms organically shy away, dodge, and tilt away from cursor
Events.on(engine, 'beforeUpdate', () => {
  if (!charmBody || !currentMousePos.active) return;
  
  // 1. Immediate Drag & Click Immunity: Zero evasion while user is dragging or holding mouse down
  if (isMouseDown || mouseConstraint.body) return;

  const now = performance.now();
  // 2. Caught Window: If recently caught with a fast swipe, keep evasion suppressed so user can grab
  if (now < caughtUntil) return;

  const charmDef = CHARMS[currentCharmId];
  if (!charmDef || !charmDef.reluctance || !charmDef.reluctance.enabled) return;

  const rel = charmDef.reluctance;

  if (charmDef.isMultiNode && nodeBodies.length > 0) {
    // Multi-node dynamic shyness & individual twisting
    nodeBodies.forEach(({ body: nb }, idx) => {
      const dx = nb.position.x - currentMousePos.x;
      const dy = nb.position.y - currentMousePos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < rel.triggerRadius) {
        const normalizedDist = dist / rel.triggerRadius;
        const proximityIntensity = Math.pow(1 - normalizedDist, 1.4);
        if (proximityIntensity <= 0.005) return;

        const nx = dx / dist;
        const ny = dy / dist;
        const fx = nx * rel.maxForce * 0.45 * proximityIntensity;
        const fy = ny * (rel.maxForce * 0.2) * proximityIntensity;

        Body.applyForce(nb, nb.position, { x: fx, y: fy });
        if (rel.angularTorque) {
          nb.torque += (nx > 0 ? 1 : -1) * rel.angularTorque * (0.8 + idx * 0.3) * proximityIntensity;
        }
      }
    });
    return;
  }

  const dx = charmBody.position.x - currentMousePos.x;
  const dy = charmBody.position.y - currentMousePos.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 0 && dist < rel.triggerRadius) {
    // 3. Fast Swipe Catch Detection:
    const approachSpeed = -(dx * mouseVelocity.x + dy * mouseVelocity.y) / dist;
    const catchThreshold = rel.catchSpeedThreshold || 6.8;

    if (approachSpeed > catchThreshold) {
      caughtUntil = now + 450;
      return;
    }

    const offsetFromAnchor = Math.abs(charmBody.position.x - startX);
    const displacementCeiling = Math.max(450, canvasWidth * 0.45);
    const ceilingFactor = Math.max(0.2, 1.0 - Math.max(0, offsetFromAnchor - 120) / displacementCeiling);

    const normalizedDist = dist / rel.triggerRadius;
    const proximityIntensity = Math.pow(1 - normalizedDist, 1.4) * ceilingFactor;

    if (proximityIntensity <= 0.005) return;

    // Unit vector pointing away from mouse
    const nx = dx / dist;
    const ny = dy / dist;

    // Balanced responsive force
    const fx = nx * rel.maxForce * proximityIntensity;
    const fy = ny * (rel.maxForce * 0.4) * proximityIntensity;

    // Apply repulsive evasion force to charm body
    Body.applyForce(charmBody, charmBody.position, { x: fx, y: fy });

    // Distribute subtle arc force across lower cord links
    if (chain && chain.bodies && chain.bodies.length > 0) {
      const len = chain.bodies.length;
      Body.applyForce(chain.bodies[len - 1], chain.bodies[len - 1].position, { x: fx * 0.4, y: fy * 0.2 });
      if (len >= 2) {
        Body.applyForce(chain.bodies[len - 2], chain.bodies[len - 2].position, { x: fx * 0.2, y: fy * 0.1 });
      }
    }

    // Defensive/reactive recoil tilt
    if (rel.angularTorque) {
      charmBody.torque += (nx > 0 ? 1 : -1) * rel.angularTorque * proximityIntensity;
    }
  }
});

// Interactive clicking rituals (e.g. Daruma eye wishing)
canvas.addEventListener('click', (e) => {
  if (!charmBody) return;
  const dist = Math.hypot(e.clientX - charmBody.position.x, e.clientY - charmBody.position.y);

  if (currentCharmId === 'daruma' && dist < 45) {
    // Cycle Daruma wishing state: 0 -> 1 -> 2 -> 0
    appState.darumaState = (appState.darumaState + 1) % 3;
    if (window.electronAPI && window.electronAPI.saveState) {
      window.electronAPI.saveState({ darumaState: appState.darumaState });
    }
  }
});

// 7. Cardinal/Catmull-Rom Smooth Spline Curve Interpolation
function drawSpline(ctx, points, tension = 0.5) {
  if (points.length < 2) return;
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i != points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

// Ghost Mode (Adaptive Transparency when cursor dwells beneath charm)
let currentCharmAlpha = 1.0;
let targetCharmAlpha = 1.0;
let cursorUnderneathTimer = 0;

Events.on(render, 'beforeRender', () => {
  // Check if cursor is directly underneath the charm body
  if (charmBody && currentMousePos && currentMousePos.active) {
    const distToCharm = Math.hypot(
      currentMousePos.x - charmBody.position.x,
      currentMousePos.y - charmBody.position.y
    );

    // If cursor stays close to charm for > 1.2s, fade to ghost mode (0.35 alpha)
    if (distToCharm < 90) {
      cursorUnderneathTimer += 16; // approx 1 frame at 60fps
      if (cursorUnderneathTimer > 1200) {
        targetCharmAlpha = 0.35;
      }
    } else {
      cursorUnderneathTimer = 0;
      targetCharmAlpha = 1.0;
    }
  } else {
    cursorUnderneathTimer = 0;
    targetCharmAlpha = 1.0;
  }

  // Smooth lerp alpha
  currentCharmAlpha += (targetCharmAlpha - currentCharmAlpha) * 0.08;
});

// 8. Custom Smooth Thread & Charm Rendering
Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  if (!ctx || !charmBody) return;

  const charmDef = CHARMS[currentCharmId] || CHARMS.nimbu;
  const img = getCharmImage(charmDef);

  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // Apply Ghost Mode Adaptive Alpha
  ctx.globalAlpha = Math.max(0.2, Math.min(1.0, currentCharmAlpha));

  // Compute dynamic knot position rotated with charm angle
  const isMulti = charmDef.isMultiNode && nodeBodies.length > 0;
  const targetKnotBody = isMulti ? nodeBodies[0].body : charmBody;
  const targetKnotOffset = isMulti ? -15 : (charmDef.knotOffset || -45);
  const cosA = Math.cos(targetKnotBody.angle);
  const sinA = Math.sin(targetKnotBody.angle);
  const knotX = targetKnotBody.position.x - sinA * targetKnotOffset;
  const knotY = targetKnotBody.position.y + cosA * targetKnotOffset;

  // Build spine points
  const points = [{ x: startX, y: 0 }];
  for (let i = 0; i < chain.bodies.length; i++) {
    points.push({ x: chain.bodies[i].position.x, y: chain.bodies[i].position.y });
  }
  points.push({ x: knotX, y: knotY });

  const cordStyle = charmDef.cord || {
    width: 2.2,
    baseColor: '#b08233',
    highlightColor: '#e2be68',
    shadowColor: 'rgba(40, 25, 10, 0.45)',
    hasKnotDot: true,
    knotBaseColor: '#8f6522',
    knotHighlightColor: '#dfba6c',
    dash: [4, 3]
  };

  const cordWidth = cordStyle.width || 3.2;

  // Pass 1: Soft Ambient Occlusion Shadow (optimized blur)
  ctx.save();
  ctx.beginPath();
  drawSpline(ctx, points, 0.65);
  ctx.shadowColor = cordStyle.shadowColor;
  ctx.shadowBlur = 3.5;
  ctx.shadowOffsetX = 1.8;
  ctx.shadowOffsetY = 3.2;
  ctx.strokeStyle = cordStyle.shadowColor;
  ctx.lineWidth = cordWidth * 0.9; // Shadow core
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Pass 2: Base Colored Cord Body
  ctx.save();
  ctx.beginPath();
  drawSpline(ctx, points, 0.65);
  ctx.strokeStyle = cordStyle.baseColor;
  ctx.lineWidth = cordWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Pass 3: Braided Fiber / Silk Highlights
  if (cordStyle.highlightColor) {
    ctx.save();
    ctx.beginPath();
    drawSpline(ctx, points, 0.65);
    ctx.strokeStyle = cordStyle.highlightColor;
    ctx.lineWidth = cordStyle.highlightWidth || 1.1; // Highlight twist
    ctx.setLineDash(cordStyle.dash || [4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Pass 4: Stem Knot & Loop (only for charms that have a rustic stem knot, e.g. Nimbu)
  if (cordStyle.hasKnotDot) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(knotX, knotY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = cordStyle.knotBaseColor || '#8f6522';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(knotX, knotY, 2, 0, Math.PI * 2);
    ctx.fillStyle = cordStyle.knotHighlightColor || '#dfba6c';
    ctx.fill();
    ctx.restore();
  }

  // 9. Draw Active Cultural Charm via its custom shader/ritual
  if (charmDef.isMultiNode && nodeBodies.length > 0) {
    // Render individual nodes with authentic nested physics & shadows
    nodeBodies.forEach(({ body: nBody, config: nodeConf }, idx) => {
      const nPos = nBody.position;
      const nAngle = nBody.angle;
      const nodeImg = getCharmImage({ id: nodeConf.id, dataUri: nodeConf.image, image: nodeConf.image });

      if (nodeImg && nodeImg.complete && nodeImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(nPos.x, nPos.y);
        ctx.rotate(nAngle);

        const drawW = nodeConf.width || 80;
        const drawH = nodeConf.height || 60;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 5;
        ctx.shadowOffsetX = 1;

        ctx.drawImage(nodeImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

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

    // Trailing strings on bottom node
    const lastNode = nodeBodies[nodeBodies.length - 1];
    if (lastNode && charmDef.stringsState) {
      const stringConfigs = [
        { attachX: -4, attachY: 18, dropLen: 42, stiffness: 0.12, damping: 0.86, restAngle: -0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 2], tipColor: '#8f6522', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(20, 15, 5, 0.25)' },
        { attachX: 0, attachY: 20, dropLen: 48, stiffness: 0.10, damping: 0.88, restAngle: 0.00, base: '#222222', highlight: '#555555', dash: [3, 2], tipColor: '#b08233', tipRadius: 2.2, width: 2.6, shadowColor: 'rgba(10, 10, 10, 0.28)' },
        { attachX: 4, attachY: 18, dropLen: 44, stiffness: 0.12, damping: 0.86, restAngle: 0.06, base: '#b08233', highlight: '#e2be68', dash: [3, 2], tipColor: '#8f6522', tipRadius: 2.0, width: 2.4, shadowColor: 'rgba(20, 15, 5, 0.25)' }
      ];
      drawZeroGravityStrings(ctx, lastNode.body, charmDef.stringsState, stringConfigs, currentMousePos);
    }
  } else {
    ctx.save();
    ctx.translate(charmBody.position.x, charmBody.position.y);
    ctx.rotate(charmBody.angle);

    const extraAssets = getCharmExtraAssets(charmDef);

    if (img && img.complete && img.naturalWidth > 0) {
      charmDef.renderCustom(ctx, charmBody, img, appState, extraAssets, currentMousePos);
    } else if (!charmDef.dataUri) {
      // Pure vector/canvas charm (e.g. Nazar evil eye)
      charmDef.renderCustom(ctx, charmBody, null, appState, extraAssets, currentMousePos);
    } else {
      // Immediate fallback while bitmap loads
      ctx.beginPath();
      ctx.arc(0, 0, charmDef.radius || 40, 0, Math.PI * 2);
      ctx.fillStyle = '#f5c518';
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
});

// Mobile Device Screen Detection & Center Anchor
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 600;
if (isMobileDevice) {
  startX = Math.round(canvasWidth / 2);
  if (anchor) {
    Body.setPosition(anchor, { x: startX, y: startY });
  }
}

// 10. Mobile Gyroscope & Accelerometer Physics
window.addEventListener('deviceorientation', (event) => {
  if (event.gamma !== null && typeof event.gamma !== 'undefined') {
    // gamma is left-to-right tilt in degrees (-90 to 90)
    const tiltX = Math.max(-1.5, Math.min(1.5, event.gamma * 0.035));
    engine.gravity.x = tiltX;
  }
  if (event.beta !== null && typeof event.beta !== 'undefined') {
    // beta is front-to-back tilt in degrees (-180 to 180)
    const tiltY = Math.max(0.4, Math.min(1.8, Math.sin(event.beta * (Math.PI / 180)) * 1.2 + 0.8));
    engine.gravity.y = tiltY;
  }
});

// Mobile Quick Drawer Toggle & Selection
const charmDrawer = document.getElementById('charm-drawer');
if (charmDrawer) {
  // Delegate clicks on charm cards
  charmDrawer.addEventListener('click', (e) => {
    const card = e.target.closest('.charm-card');
    if (card) {
      const selectedId = card.getAttribute('data-charm');
      if (selectedId && CHARMS[selectedId]) {
        appState.activeCharm = selectedId;
        attachCharm(selectedId);
        charmDrawer.classList.add('hidden');
      }
    }
  });

  // Close drawer if user drags outside
  document.addEventListener('touchstart', (e) => {
    if (!charmDrawer.contains(e.target) && !charmDrawer.classList.contains('hidden')) {
      charmDrawer.classList.add('hidden');
    }
  });
}

// Handle In-App Dashboard vs. Transparent Overlay Mode
const appDashboard = document.getElementById('app-dashboard');
const urlParams = new URLSearchParams(window.location.search);
const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
const isOverlayMode = urlParams.get('overlay') === 'true' || isElectron;

if (isOverlayMode) {
  if (appDashboard) appDashboard.classList.add('hidden-overlay');
} else {
  // We are running inside the standalone Android launcher app!
  document.body.classList.add('mobile-standalone-app');
  if (appDashboard) {
    appDashboard.addEventListener('click', (e) => {
      const card = e.target.closest('.dash-card');
      if (card) {
        document.querySelectorAll('.dash-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const charmId = card.getAttribute('data-charm');
        if (charmId && CHARMS[charmId]) {
          appState.activeCharm = charmId;
          attachCharm(charmId);
          // Broadcast to floating service if running
          if (window.setDangleCharm) window.setDangleCharm(charmId);
        }
      }
    });

    const hangBtn = document.getElementById('btn-hang-dangle');
    if (hangBtn) {
      hangBtn.addEventListener('click', () => {
        // Minimize app to desktop so overlay hangs freely
        window.history.back();
      });
    }

    // Device Sync & Google Auth Modal Handlers
    const pairBtn = document.getElementById('btn-device-pair');
    const syncModal = document.getElementById('device-sync-modal');
    const closeSyncBtn = document.getElementById('btn-close-device-modal');
    const submitPinBtn = document.getElementById('btn-submit-pin');
    const googleMobileBtn = document.getElementById('btn-google-device-login');

    if (pairBtn && syncModal) {
      pairBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        syncModal.classList.remove('hidden');
      });
    }

    if (closeSyncBtn && syncModal) {
      closeSyncBtn.addEventListener('click', () => {
        syncModal.classList.add('hidden');
      });
    }

    if (submitPinBtn && syncModal) {
      submitPinBtn.addEventListener('click', () => {
        const pinVal = document.getElementById('input-pairing-pin')?.value;
        if (pinVal && pinVal.length >= 6) {
          alert('Screen paired successfully to your Jinglee Cloud Account!');
          syncModal.classList.add('hidden');
        } else {
          alert('Please enter a valid 6-digit PIN.');
        }
      });
    }

    if (googleMobileBtn && syncModal) {
      googleMobileBtn.addEventListener('click', () => {
        alert('Signed in with Google! Device registered.');
        syncModal.classList.add('hidden');
      });
    }
  }
}

// Initial Charm from query
const initCharm = urlParams.get('charm');
if (initCharm && CHARMS[initCharm]) {
  appState.activeCharm = initCharm;
  attachCharm(initCharm);
}

// 11. IPC Listeners for Menu Actions (Desktop)
if (window.electronAPI) {

  // Switch charm
  if (window.electronAPI.onCharmChange) {
    window.electronAPI.onCharmChange((charmId) => {
      appState.activeCharm = charmId;
      attachCharm(charmId);
    });
  }

  // Charm action handlers (repaint, decay reset, wish state)
  if (window.electronAPI.onCharmAction) {
    window.electronAPI.onCharmAction((action, payload) => {
      if (action === 'reset-decay') {
        appState.nimbuHungTime = payload.hungTime;
      } else if (action === 'set-drishti-palette') {
        appState.drishtiPalette = payload.palette;
      } else if (action === 'set-daruma-state') {
        appState.darumaState = payload.state;
      }
    });
  }

  // Anchor position from tray bounds
  if (window.electronAPI.onInitAnchor) {
    window.electronAPI.onInitAnchor((anchorX) => {
      setAnchorX(anchorX);
    });
  }
}

// 12. Clean-up listener
window.addEventListener('beforeunload', () => {
  Render.stop(render);
  Runner.stop(runner);
  Engine.clear(engine);
});
