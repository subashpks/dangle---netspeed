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
  if (!charmDef.dataUri) return null;
  if (!charmImages[charmDef.id]) {
    const img = new Image();
    img.src = charmDef.dataUri;
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

function attachCharm(charmId) {
  const charmDef = CHARMS[charmId] || CHARMS.nimbu;
  currentCharmId = charmDef.id;

  // Clean up previous charm
  if (charmBody && charmPin) {
    Composite.remove(engine.world, [charmBody, charmPin]);
  }

  const lastLink = chain.bodies[chain.bodies.length - 1];
  const attachY = lastLink.position.y + linkHeight / 2 + Math.abs(charmDef.knotOffset);

  charmBody = Bodies.circle(lastLink.position.x, attachY, charmDef.radius, {
    collisionFilter: { group: chainGroup },
    density: charmDef.density,
    frictionAir: 0.032,
    restitution: charmDef.restitution,
    render: { visible: false }
  });

  charmPin = Constraint.create({
    bodyA: lastLink,
    bodyB: charmBody,
    pointA: { x: 0, y: linkHeight / 2 },
    pointB: { x: 0, y: charmDef.knotOffset },
    stiffness: 0.58,
    length: 3,
    damping: 0.16,
    render: { visible: false }
  });

  Composite.add(engine.world, [charmBody, charmPin]);
  getCharmImage(charmDef);
  getCharmExtraAssets(charmDef);
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
let currentMousePos = { x: -9999, y: -9999, active: false };
let lastIpcCallTime = 0;

window.addEventListener('mousemove', (e) => {
  currentMousePos.x = e.clientX;
  currentMousePos.y = e.clientY;
  currentMousePos.active = true;

  if (!charmBody || !window.electronAPI || !window.electronAPI.setIgnoreMouseEvents) return;

  const mx = e.clientX;
  const my = e.clientY;
  const charmDef = CHARMS[currentCharmId];

  // Hit test against charm body & suspension cord
  const charmR = charmDef?.radius || 48;
  const distToCharm = Math.hypot(mx - charmBody.position.x, my - charmBody.position.y);
  
  // If charm has reluctance enabled, expand capture radius so approaching cursor exerts reluctance
  const reluctanceZone = charmDef?.reluctance?.enabled ? charmDef.reluctance.triggerRadius + 20 : 0;
  // Bounding check covers charm radius plus top accessories/beads up to knotOffset, and bottom feathers
  const topBound = charmDef?.knotOffset ? charmBody.position.y + charmDef.knotOffset - 12 : charmBody.position.y - 60;
  const bottomExtra = currentCharmId === 'dreamcatcher' ? 95 : 10;
  const isNearCharm = distToCharm <= Math.max(charmR + 20, reluctanceZone) ||
                      (Math.abs(mx - charmBody.position.x) <= 46 &&
                       my >= topBound && my <= charmBody.position.y + charmR + bottomExtra);
  const isNearThread = my >= 0 && my <= charmBody.position.y && Math.abs(mx - startX) <= 24;

  const shouldCapture = isNearCharm || isNearThread || !!mouseConstraint.body;

  const now = performance.now();
  if (shouldCapture && isIgnoringMouse) {
    isIgnoringMouse = false;
    lastIpcCallTime = now;
    window.electronAPI.setIgnoreMouseEvents(false);
  } else if (!shouldCapture && !isIgnoringMouse && now - lastIpcCallTime > 40) {
    isIgnoringMouse = true;
    lastIpcCallTime = now;
    window.electronAPI.setIgnoreMouseEvents(true, true);
  }
});

window.addEventListener('mouseleave', () => {
  currentMousePos.active = false;
  if (!isIgnoringMouse && window.electronAPI && window.electronAPI.setIgnoreMouseEvents) {
    isIgnoringMouse = true;
    window.electronAPI.setIgnoreMouseEvents(true, true);
  }
});

// Reluctance Physics Hook: Charm gently evades cursor when approached, unless dragged
Events.on(engine, 'beforeUpdate', () => {
  if (!charmBody || !currentMousePos.active) return;
  
  // If user is actively dragging the charm with mouseConstraint, don't apply evasion
  if (mouseConstraint.body) return;

  const charmDef = CHARMS[currentCharmId];
  if (!charmDef || !charmDef.reluctance || !charmDef.reluctance.enabled) return;

  const rel = charmDef.reluctance;
  const dx = charmBody.position.x - currentMousePos.x;
  const dy = charmBody.position.y - currentMousePos.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 0 && dist < rel.triggerRadius) {
    // Smooth cosine/cubic falloff curve: 1 at 0 distance, 0 at triggerRadius
    const normalizedDist = dist / rel.triggerRadius;
    const intensity = Math.pow(1 - normalizedDist, 1.8);

    // Evasion unit vector pointing away from mouse
    const nx = dx / dist;
    const ny = dy / dist;

    // Apply repulsive force (stronger horizontally to induce natural pendulum sway)
    const fx = nx * rel.maxForce * intensity;
    const fy = ny * (rel.maxForce * 0.45) * intensity;

    Body.applyForce(charmBody, charmBody.position, { x: fx, y: fy });

    // Slight defensive recoil tilt
    if (rel.angularTorque) {
      charmBody.torque += (nx > 0 ? 1 : -1) * rel.angularTorque * intensity;
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

// 8. Custom Smooth Thread & Charm Rendering
Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  if (!ctx || !charmBody) return;

  const charmDef = CHARMS[currentCharmId] || CHARMS.nimbu;
  const img = getCharmImage(charmDef);

  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // Compute dynamic knot position rotated with charm angle
  const cosA = Math.cos(charmBody.angle);
  const sinA = Math.sin(charmBody.angle);
  const knotX = charmBody.position.x - sinA * charmDef.knotOffset;
  const knotY = charmBody.position.y + cosA * charmDef.knotOffset;

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

  const cordWidth = 3.2; // Universal standard thickness across all cords

  // Pass 1: Soft Ambient Occlusion Shadow (optimized blur)
  ctx.save();
  ctx.beginPath();
  drawSpline(ctx, points, 0.65);
  ctx.shadowColor = cordStyle.shadowColor;
  ctx.shadowBlur = 3.5;
  ctx.shadowOffsetX = 1.8;
  ctx.shadowOffsetY = 3.2;
  ctx.strokeStyle = cordStyle.shadowColor;
  ctx.lineWidth = cordWidth * 0.9; // 2.88px shadow core
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Pass 2: Base Colored Cord Body
  ctx.save();
  ctx.beginPath();
  drawSpline(ctx, points, 0.65);
  ctx.strokeStyle = cordStyle.baseColor;
  ctx.lineWidth = cordWidth; // Exactly 3.2px
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Pass 3: Braided Fiber / Silk Highlights
  if (cordStyle.highlightColor) {
    ctx.strokeStyle = cordStyle.highlightColor;
    ctx.lineWidth = 1.1; // 1.1px highlight twist
    ctx.setLineDash(cordStyle.dash || [4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

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
  ctx.save();
  ctx.translate(charmBody.position.x, charmBody.position.y);
  ctx.rotate(charmBody.angle);

  const extraAssets = getCharmExtraAssets(charmDef);

  if (img && img.complete && img.naturalWidth > 0) {
    charmDef.renderCustom(ctx, charmBody, img, appState, extraAssets);
  } else if (!charmDef.dataUri) {
    // Pure vector/canvas charm (e.g. Nazar evil eye)
    charmDef.renderCustom(ctx, charmBody, null, appState, extraAssets);
  } else {
    // Immediate fallback while bitmap loads
    ctx.beginPath();
    ctx.arc(0, 0, charmDef.radius || 40, 0, Math.PI * 2);
    ctx.fillStyle = '#f5c518';
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
});

// 10. IPC Listeners for Menu Actions
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
