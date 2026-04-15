/**
 * Genera los iconos PNG para PWA a partir del SVG del favicon.
 * Uso: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'public', 'icons')

mkdirSync(outDir, { recursive: true })

// ── SVG base (favicon.svg escalado a 512×512) ────────────────────────────────
const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eb3d63"/>
      <stop offset="100%" stop-color="#b82a49"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d060"/>
      <stop offset="100%" stop-color="#d4960a"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#bg)"/>
  <rect width="32" height="18" rx="7" fill="url(#shine)"/>
  <text x="16" y="22" text-anchor="middle" fill="white"
    font-family="'Arial Black','Helvetica Neue',Arial,sans-serif"
    font-weight="900" font-size="15" letter-spacing="-1">JR</text>
  <circle cx="27" cy="5" r="4.5" fill="url(#gold)"/>
  <circle cx="26" cy="4" r="1.8" fill="white" fill-opacity="0.45"/>
</svg>`

// ── SVG maskable: icono centrado al 80% sobre fondo sólido ──────────────────
// Safe zone: 10% padding en cada lado (80% del área = zona segura para recorte)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eb3d63"/>
      <stop offset="100%" stop-color="#b82a49"/>
    </linearGradient>
    <linearGradient id="mgold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d060"/>
      <stop offset="100%" stop-color="#d4960a"/>
    </linearGradient>
    <linearGradient id="mshine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- Fondo completo (para recorte de cualquier forma) -->
  <rect width="512" height="512" fill="url(#mbg)"/>
  <!-- Ícono centrado al 80% (offset 10% = 51.2px) -->
  <svg x="51" y="51" width="410" height="410" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="7" fill="#eb3d63" fill-opacity="0.01"/>
    <rect width="32" height="18" rx="7" fill="url(#mshine)"/>
    <text x="16" y="22" text-anchor="middle" fill="white"
      font-family="'Arial Black','Helvetica Neue',Arial,sans-serif"
      font-weight="900" font-size="15" letter-spacing="-1">JR</text>
    <circle cx="27" cy="5" r="4.5" fill="url(#mgold)"/>
    <circle cx="26" cy="4" r="1.8" fill="white" fill-opacity="0.45"/>
  </svg>
</svg>`

// ── Tamaños a generar ─────────────────────────────────────────────────────────
const icons = [
  { name: 'icon-144.png',          size: 144, svg: baseSvg },
  { name: 'icon-180.png',          size: 180, svg: baseSvg },  // apple-touch-icon
  { name: 'icon-192.png',          size: 192, svg: baseSvg },
  { name: 'icon-512.png',          size: 512, svg: baseSvg },
  { name: 'icon-512-maskable.png', size: 512, svg: maskableSvg },
]

console.log('Generando iconos PWA...\n')

for (const { name, size, svg } of icons) {
  const outPath = resolve(outDir, name)
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath)
  console.log(`  ✓ ${name} (${size}×${size})`)
}

console.log('\n¡Iconos generados en public/icons/!')
