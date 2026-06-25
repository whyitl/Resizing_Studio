#!/usr/bin/env node
/**
 * Regenerate 1200×630 Open Graph images from the local dev server.
 * Usage: npm run dev (in another terminal), then npm run capture:og
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../src/public/og')
const baseUrl = process.env.OG_BASE_URL || 'http://localhost:5173'

const captures = [
  { url: '/', selector: 'header.nav', file: 'home.jpg' },
  { url: '/contact', selector: '.contact', file: 'contact.jpg' },
  { url: '/', selector: 'header.nav', file: 'default.jpg' },
]

async function ensurePlaywright() {
  try {
    return await import('playwright')
  } catch {
    const { execSync } = await import('node:child_process')
    execSync('npm install --no-save playwright sharp', {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
    })
    execSync('npx playwright install chromium', {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
    })
    return await import('playwright')
  }
}

async function cropToOg(buffer) {
  const sharp = (await import('sharp')).default
  const meta = await sharp(buffer).metadata()
  const width = meta.width ?? 1200
  const height = meta.height ?? 630
  const targetRatio = 1200 / 630
  const currentRatio = width / height

  let cropWidth = width
  let cropHeight = height
  if (currentRatio > targetRatio) {
    cropWidth = Math.round(height * targetRatio)
  } else {
    cropHeight = Math.round(width / targetRatio)
  }

  const left = Math.max(0, Math.round((width - cropWidth) / 2))
  const top = Math.max(0, Math.round((height - cropHeight) / 2))

  return sharp(buffer)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const { chromium } = await ensurePlaywright()
  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2,
  })

  for (const { url, selector, file } of captures) {
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' })
    await page.waitForSelector(selector, { timeout: 15000 })
    const shot = await page.locator(selector).first().screenshot({ type: 'png' })
    const og = await cropToOg(shot)
    await writeFile(resolve(outDir, file), og)
    console.log(`Wrote og/${file}`)
  }

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
