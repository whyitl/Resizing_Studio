/**
 * "Sun over YYC" — live sun position over Calgary, computed locally
 * with the standard sunrise equation (no API). The sun rides a day arc
 * from sunrise to sunset; after dark a moon tracks back under the horizon.
 */

const LAT = 51.0447
const LON = -114.0719 // east-positive
const TZ = 'America/Edmonton'
const DAY_MS = 86_400_000
const RAD = Math.PI / 180

/* Arc geometry — must match the SVG paths in partials/footer.html */
const CX = 80
const HORIZON = 46
const RX = 68
const RY_DAY = 38
const RY_NIGHT = 14

interface SunTimes {
  rise: Date
  set: Date
}

type Phase = 'day' | 'golden' | 'twilight' | 'night'

const PHASE_LABEL: Record<Phase, string> = {
  day: 'Daylight',
  golden: 'Golden hour',
  twilight: 'Twilight',
  night: 'Night',
}

function calgaryDate(d: Date): [number, number, number] {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value)
  return [get('year'), get('month'), get('day')]
}

/** Sunrise/sunset for a Calgary calendar date (sunrise equation, ±1 min). */
function sunTimes(year: number, month: number, day: number): SunTimes | null {
  const n = Math.round((Date.UTC(year, month - 1, day, 12) - Date.UTC(2000, 0, 1, 12)) / DAY_MS)
  const jStar = n - LON / 360
  const m = (357.5291 + 0.98560028 * jStar) % 360
  const c = 1.9148 * Math.sin(m * RAD) + 0.02 * Math.sin(2 * m * RAD) + 0.0003 * Math.sin(3 * m * RAD)
  const lambda = (m + c + 180 + 102.9372) % 360
  const jTransit = 2451545 + jStar + 0.0053 * Math.sin(m * RAD) - 0.0069 * Math.sin(2 * lambda * RAD)
  const sinDec = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD)
  const cosDec = Math.cos(Math.asin(sinDec))
  const cosW = (Math.sin(-0.833 * RAD) - Math.sin(LAT * RAD) * sinDec) / (Math.cos(LAT * RAD) * cosDec)
  if (cosW < -1 || cosW > 1) return null

  const w = Math.acos(cosW) / RAD
  const toDate = (j: number): Date => new Date((j - 2440587.5) * DAY_MS)
  return { rise: toDate(jTransit - w / 360), set: toDate(jTransit + w / 360) }
}

function shiftDate([y, m, d]: [number, number, number], days: number): [number, number, number] {
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()]
}

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  hour: 'numeric',
  minute: '2-digit',
})

function setTime(el: Element | null, arrow: string, label: string, date: Date): void {
  if (!el) return
  el.innerHTML = ''
  const glyph = document.createElement('span')
  glyph.setAttribute('aria-hidden', 'true')
  glyph.textContent = `${arrow} `
  const sr = document.createElement('span')
  sr.className = 'visually-hidden'
  sr.textContent = `${label} `
  el.append(glyph, sr, timeFmt.format(date))
}

function update(root: HTMLElement): void {
  const now = new Date()
  const today = calgaryDate(now)
  const t = sunTimes(...today)
  if (!t) return

  const body = root.querySelector('[data-sun-body]')
  const progress = root.querySelector('[data-sun-progress]')
  const stateEl = root.querySelector('[data-sun-state]')

  let phase: Phase
  let x: number
  let y: number
  let dayFrac: number

  const ms = now.getTime()
  const rise = t.rise.getTime()
  const set = t.set.getTime()

  if (ms >= rise && ms <= set) {
    dayFrac = (ms - rise) / (set - rise)
    const theta = Math.PI * (1 - dayFrac)
    x = CX + RX * Math.cos(theta)
    y = HORIZON - RY_DAY * Math.sin(theta)
    phase = ms - rise < 3_600_000 || set - ms < 3_600_000 ? 'golden' : 'day'
  } else {
    // Night: travel from last sunset (right) back to next sunrise (left) under the horizon
    const prevSet = ms > set ? set : sunTimes(...shiftDate(today, -1))?.set.getTime() ?? set - DAY_MS
    const nextRise = ms < rise ? rise : sunTimes(...shiftDate(today, 1))?.rise.getTime() ?? rise + DAY_MS
    const nightFrac = Math.min(1, Math.max(0, (ms - prevSet) / (nextRise - prevSet)))
    x = CX + RX * Math.cos(Math.PI * nightFrac)
    y = HORIZON + RY_NIGHT * Math.sin(Math.PI * nightFrac)
    dayFrac = ms > set ? 1 : 0
    phase = ms - prevSet < 1_800_000 || nextRise - ms < 1_800_000 ? 'twilight' : 'night'
  }

  root.dataset.phase = phase
  body?.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`)
  progress?.setAttribute('stroke-dasharray', `${(dayFrac * 100).toFixed(2)} 100`)
  if (stateEl) stateEl.textContent = PHASE_LABEL[phase]

  setTime(root.querySelector('[data-sun-rise]'), '↑', 'Sunrise', t.rise)
  setTime(root.querySelector('[data-sun-set]'), '↓', 'Sunset', t.set)
}

export function initSun(): void {
  const root = document.getElementById('sun')
  if (!root) return
  update(root)
  setInterval(() => update(root), 60_000)
}
