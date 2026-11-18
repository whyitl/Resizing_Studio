#!/usr/bin/env node
/**
 * Regenerate 1200×630 Open Graph images from the local dev server.
 * Each image is a straight viewport capture of the top of the page
 * (nav + hero), taken once the intro animations have settled.
 *
 * Usage: npm run dev (in another terminal), then npm run capture:og
 */
import { mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../src/public/og')
const baseUrl = process.env.OG_BASE_URL || 'http://localhost:5173'

const captures = [
  { url: '/', file: 'home.jpg' },
  { url: '/contact', file: 'contact.jpg' },
  { url: '/', file: 'default.jpg' },
]

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    const { execSync } = await import('node:child_process')
    execSync('npm install --no-save playwright', {
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

async function main() {
  await mkdir(outDir, { recursive: true })
  const { chromium } = await loadPlaywright()
  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })

  for (const { url, file } of captures) {
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(3200) // let the hero frame finish its resize intro
    await page.screenshot({
      path: resolve(outDir, file),
      type: 'jpeg',
      quality: 88,
    })
    console.log(`Wrote og/${file}`)
  }

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
