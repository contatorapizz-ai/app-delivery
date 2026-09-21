import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const svgPath = path.join(root, '..', 'src', 'brand', 'logo-mark.svg')
const outDir = path.join(root, '..', 'public', 'icons')

await mkdir(outDir, { recursive: true })

const sizes = [192, 512]
for (const size of sizes) {
  await sharp(svgPath, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`))
  console.log(`generated icon-${size}.png`)
}

await sharp(svgPath, { density: 384 })
  .resize(180, 180)
  .png()
  .toFile(path.join(root, '..', 'public', 'apple-touch-icon.png'))

console.log('generated apple-touch-icon.png')
