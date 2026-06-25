#!/usr/bin/env node
/**
 * Verify required static assets exist before production build.
 * Pass --strict to exit with code 1 when assets are missing.
 */
import { access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../src/public')
const strict = process.argv.includes('--strict')

const REQUIRED = [
  'favicon.svg',
  'Calgary_Sky.webp',
  'PureGlowHome.webp',
  'PureGlowServices.webp',
  'TUCNHome.webp',
  'TUCNServices.webp',
  'og/home.jpg',
  'og/contact.jpg',
  'og/default.jpg',
]

const missing = []
for (const file of REQUIRED) {
  try {
    await access(resolve(publicDir, file))
  } catch {
    missing.push(file)
  }
}

if (missing.length === 0) {
  console.log('All required static assets present.')
  process.exit(0)
}

console.warn(`\n⚠ Missing ${missing.length} static asset(s) in src/public/:`)
for (const file of missing) console.warn(`  - ${file}`)
console.warn(
  '\nAdd the image files to src/public/ (and src/public/og/) before deploying.',
)
console.warn('Run `npm run capture:og` while the dev server is running to generate OG images.\n')

if (strict) process.exit(1)
