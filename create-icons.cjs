/**
 * create-icons.cjs — Genera íconos PNG para PWA (sin librerías externas)
 * Crea un ícono verde oscuro con la letra "C" para CampoFinanzas
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 (requerido por PNG)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const cb = Buffer.concat([tb, data]);
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(cb));
  return Buffer.concat([len, tb, data, crc]);
}

/**
 * Genera PNG sólido con gradiente y contiene el logo "CF"
 * @param {number} size 
 */
function createCampoIcon(size) {
  const W = size, H = size;
  const raw = Buffer.allocUnsafe(H * (1 + W * 4)); // RGBA

  // Colores: fondo #1B4332 (27,67,50) borde redondeado
  const BG_R = 27, BG_G = 67, BG_B = 50;
  const GOLD_R = 201, GOLD_G = 168, GOLD_B = 76; // #C9A84C

  const radius = size * 0.22; // radio de bordes redondeados
  const cx = W / 2, cy = H / 2;

  for (let y = 0; y < H; y++) {
    const base = y * (1 + W * 4);
    raw[base] = 0; // filtro None
    for (let x = 0; x < W; x++) {
      const off = base + 1 + x * 4;

      // ¿Dentro del rectángulo redondeado?
      const dx = Math.max(0, Math.abs(x - cx) - (W / 2 - radius));
      const dy = Math.max(0, Math.abs(y - cy) - (H / 2 - radius));
      const inRounded = dx * dx + dy * dy <= radius * radius;

      if (!inRounded) {
        // Fuera del ícono = transparente
        raw[off] = 0; raw[off+1] = 0; raw[off+2] = 0; raw[off+3] = 0;
        continue;
      }

      // Fondo verde
      let r = BG_R, g = BG_G, b = BG_B, a = 255;

      // "Sprout" simplificado: C dorado en el centro
      const nx = (x - cx) / (W * 0.3);
      const ny = (y - cy) / (H * 0.3);

      // Tallo (rectángulo vertical)
      if (Math.abs(nx) < 0.12 && ny > -0.1 && ny < 0.55) {
        r = GOLD_R; g = GOLD_G; b = GOLD_B;
      }
      // Hoja izquierda
      if (nx > -0.65 && nx < -0.05 && ny > -0.65 && ny < 0.1) {
        const dist = Math.sqrt((nx + 0.35) ** 2 + (ny + 0.25) ** 2);
        if (dist < 0.38) { r = GOLD_R; g = GOLD_G; b = GOLD_B; }
      }
      // Hoja derecha
      if (nx > 0.05 && nx < 0.65 && ny > -0.65 && ny < 0.1) {
        const dist = Math.sqrt((nx - 0.35) ** 2 + (ny + 0.25) ** 2);
        if (dist < 0.38) { r = GOLD_R; g = GOLD_G; b = GOLD_B; }
      }

      raw[off] = r; raw[off+1] = g; raw[off+2] = b; raw[off+3] = a;
    }
  }

  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Crear carpeta public/icons/
const iconsDir = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const s of sizes) {
  const png = createCampoIcon(s);
  const out = path.join(iconsDir, `icon-${s}x${s}.png`);
  fs.writeFileSync(out, png);
  console.log(`✅ icon-${s}x${s}.png (${png.length} bytes)`);
}

// También apple-touch-icon (180x180)
const apple = createCampoIcon(180);
fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png'), apple);
console.log('✅ apple-touch-icon.png (180x180)');

// favicon.png (32x32)
const favicon = createCampoIcon(32);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.png'), favicon);
console.log('✅ favicon.png (32x32)');

console.log('\n✓ Todos los íconos generados en public/icons/');
