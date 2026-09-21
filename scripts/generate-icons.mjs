import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const markPath = path.join(root, '..', 'src', 'brand', 'logo-mark.svg')
const outDir = path.join(root, '..', 'public', 'icons')
const publicDir = path.join(root, '..', 'public')

const NAVY = '#191f6b'

await mkdir(outDir, { recursive: true })

const markSvg = await readFile(markPath, 'utf8')

async function markPng(size) {
  return sharp(Buffer.from(markSvg), { density: 384 }).resize(size, size).png().toBuffer()
}

function backgroundSvg(size, radius) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/></svg>`,
  )
}

async function appIcon(size, radiusRatio) {
  const markSize = Math.round(size * 0.62)
  const bg = await sharp(backgroundSvg(size, Math.round(size * radiusRatio))).png().toBuffer()
  const mark = await markPng(markSize)
  return sharp(bg)
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer()
}

const icon192 = await appIcon(192, 0.22)
await writeFile(path.join(outDir, 'icon-192.png'), icon192)
console.log('generated icon-192.png')

const icon512 = await appIcon(512, 0.22)
await writeFile(path.join(outDir, 'icon-512.png'), icon512)
console.log('generated icon-512.png')

const appleTouch = await appIcon(180, 0.22)
await writeFile(path.join(publicDir, 'apple-touch-icon.png'), appleTouch)
console.log('generated apple-touch-icon.png')

// Re-express the mark path in the favicon's own coordinate space, scaled/centered into a 512x512 viewBox.
const markViewBoxMatch = markSvg.match(/viewBox="([^"]+)"/)
const [vbX, vbY, vbW, vbH] = markViewBoxMatch[1].split(' ').map(Number)
const pathD = markSvg.match(/d="([^"]+)"/)[1]
const targetSize = 512 * 0.62
const scale = targetSize / Math.max(vbW, vbH)
const offsetX = (512 - vbW * scale) / 2 - vbX * scale
const offsetY = (512 - vbH * scale) / 2 - vbY * scale

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${NAVY}"/>
  <g transform="translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path fill="#e5194c" d="${pathD}"/>
  </g>
</svg>
`
await writeFile(path.join(publicDir, 'favicon.svg'), favicon)
console.log('generated favicon.svg')
