const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node PNG builder (no canvas binary dependency needed)
function createPNG(width, height, pixelShader) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // Deflate
  ihdr.writeUInt8(0, 11); // Filter method
  ihdr.writeUInt8(0, 12); // Interlace method

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);

    // CRC32
    let crc = 0xffffffff;
    const chunkTypeAndData = buf.subarray(4, 8 + len);
    for (let i = 0; i < chunkTypeAndData.length; i++) {
      crc = updateCrc(crc, chunkTypeAndData[i]);
    }
    buf.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 8 + len);
    return buf;
  }

  // Precomputed CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function updateCrc(crc, byte) {
    return crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte (0) per row
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelShader(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Generate trayTemplate.png (18x18 macOS template icon: minimalist dangle hook)
const tray1x = createPNG(18, 18, (x, y, w, h) => {
  const cx = 9;
  // Draw hook / dangle loop
  const distCircle = Math.hypot(x - cx, y - 5);
  if (distCircle >= 2 && distCircle <= 3.8 && y <= 6) {
    return [0, 0, 0, 255]; // Black for template icon
  }
  // Hook stem
  if (x === cx && y >= 6 && y <= 11) {
    return [0, 0, 0, 255];
  }
  // Bottom charm bead
  const distBead = Math.hypot(x - cx, y - 13);
  if (distBead <= 2.2) {
    return [0, 0, 0, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(assetsDir, 'trayTemplate.png'), tray1x);

// 2. Generate trayTemplate@2x.png (36x36)
const tray2x = createPNG(36, 36, (x, y, w, h) => {
  const cx = 18;
  const distCircle = Math.hypot(x - cx, y - 10);
  if (distCircle >= 4 && distCircle <= 7.5 && y <= 12) {
    return [0, 0, 0, 255];
  }
  if ((x === 17 || x === 18) && y >= 12 && y <= 22) {
    return [0, 0, 0, 255];
  }
  const distBead = Math.hypot(x - cx, y - 26);
  if (distBead <= 4.5) {
    return [0, 0, 0, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(assetsDir, 'trayTemplate@2x.png'), tray2x);

// 3. Generate charm.png (96x96 vibrant glossy gold & ruby lucky amulet)
const charmPng = createPNG(96, 96, (x, y, w, h) => {
  const cx = 48;
  const cy = 48;
  const dist = Math.hypot(x - cx, y - cy);

  // Outer gold ring
  if (dist <= 44 && dist >= 38) {
    const shine = Math.sin((x + y) / 10) * 25;
    return [230 + shine, 190 + shine, 50, 255];
  }

  // Inner coin/amulet disc
  if (dist < 38) {
    // Radial gradient glow
    const t = dist / 38;
    // Glossy jewel ruby/crimson center
    const r = Math.round(235 * (1 - t * 0.4));
    const g = Math.round(40 * (1 - t * 0.5));
    const b = Math.round(75 * (1 - t * 0.3));

    // Top-left specular highlight
    const spec = Math.hypot(x - 36, y - 36);
    if (spec < 14) {
      const specAmt = (1 - spec / 14);
      return [
        Math.min(255, Math.round(r + 200 * specAmt)),
        Math.min(255, Math.round(g + 180 * specAmt)),
        Math.min(255, Math.round(b + 180 * specAmt)),
        255
      ];
    }
    return [r, g, b, 255];
  }

  // Top hanger loop
  const loopDist = Math.hypot(x - cx, y - 5);
  if (loopDist <= 6 && loopDist >= 3 && y <= 6) {
    return [235, 195, 55, 255];
  }

  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(assetsDir, 'charm.png'), charmPng);

console.log('Successfully generated clean starter assets: trayTemplate.png, trayTemplate@2x.png, charm.png');
