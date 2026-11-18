/**
 * Calgary weather cell in the footer telemetry strip (Open-Meteo, no key).
 * Maps WMO weather codes to icons, shows wind, and — a Calgary-only
 * flourish — flags warm, gusty westerlies in the cold months as chinook-ish.
 */

const CALGARY_LAT = 51.0447
const CALGARY_LON = -114.0719

type Condition = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

const svg = (body: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

const CLOUD = '<path d="M17.5 18.5H8a4.5 4.5 0 1 1 1.3-8.8A5.5 5.5 0 0 1 19.8 12a3.3 3.3 0 0 1-2.3 6.5z"/>'
const CLOUD_HIGH = '<path d="M17.5 15H8a4.5 4.5 0 1 1 1.3-8.8A5.5 5.5 0 0 1 19.8 8.5 3.3 3.3 0 0 1 17.5 15z"/>'

const ICONS = {
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'),
  moon: svg('<path d="M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2z"/>'),
  partly: svg('<path d="M8 2.5v1.2M3.2 7.5H2M4.3 3.8l.9.9M12.6 3.8l-.9.9"/><path d="M5.2 10.6A3.6 3.6 0 0 1 11.5 6"/><path d="M17.5 20H9.5a4 4 0 1 1 1.2-7.8A5 5 0 0 1 20 14.3a3 3 0 0 1-2.5 5.7z"/>'),
  cloudy: svg(CLOUD),
  fog: svg('<path d="M4 8h13M3 12h18M6 16h14M4 20h10"/>'),
  rain: svg(`${CLOUD_HIGH}<path d="M8 18.5l-1 2.5M12 18.5l-1 2.5M16 18.5l-1 2.5"/>`),
  snow: svg(`${CLOUD_HIGH}<path d="M8 19h.01M12 21h.01M16 19h.01M10 22.5h.01M14 22.5h.01"/>`),
  storm: svg(`${CLOUD_HIGH}<path d="M12.5 15.5 10 19h4l-2.5 3.5"/>`),
} as const

const LABELS: Record<Condition, string> = {
  clear: 'Clear',
  partly: 'Partly cloudy',
  cloudy: 'Overcast',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Thunderstorm',
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    is_day: number
  }
}

function condition(code: number): Condition {
  if (code <= 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}

function icon(cond: Condition, isDay: boolean): string {
  switch (cond) {
    case 'clear':
      return isDay ? ICONS.sun : ICONS.moon
    case 'partly':
      return isDay ? ICONS.partly : ICONS.cloudy
    case 'drizzle':
      return ICONS.rain
    default:
      return ICONS[cond]
  }
}

/** Warm, gusty westerly in the cold months — the classic chinook signature. */
function looksLikeChinook(temp: number, speed: number, dir: number): boolean {
  const month = new Date().getMonth() + 1
  const coldSeason = month >= 10 || month <= 4
  return coldSeason && temp >= 5 && speed >= 25 && dir >= 200 && dir <= 300
}

export async function initWeather(): Promise<void> {
  const el = document.getElementById('weather')
  if (!el) return

  const iconEl = el.querySelector('[data-weather-icon]')
  const tempEl = el.querySelector('[data-weather-temp]')
  const labelEl = el.querySelector('[data-weather-label]')
  const windEl = el.querySelector('[data-weather-wind]')

  if (iconEl) iconEl.innerHTML = ICONS.cloudy

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(CALGARY_LAT))
    url.searchParams.set('longitude', String(CALGARY_LON))
    url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day')
    url.searchParams.set('temperature_unit', 'celsius')
    url.searchParams.set('wind_speed_unit', 'kmh')

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const { current } = (await res.json()) as OpenMeteoResponse
    const temp = Math.round(current.temperature_2m)
    const cond = condition(current.weather_code)
    const isDay = current.is_day === 1
    const label = cond === 'clear' && isDay ? 'Sunny' : LABELS[cond]
    const speed = Math.round(current.wind_speed_10m)
    const dir = current.wind_direction_10m
    const compass = COMPASS[Math.round(dir / 45) % 8] ?? 'N'

    if (iconEl) iconEl.innerHTML = icon(cond, isDay)
    if (tempEl) tempEl.textContent = `${temp}°C`
    if (labelEl) {
      labelEl.textContent = looksLikeChinook(temp, speed, dir) ? `${label} · Chinook vibes` : label
    }
    if (windEl) {
      // Arrow points where the wind is blowing to (meteorological dir is where it comes from)
      windEl.innerHTML = `<svg class="tele__wind-arrow" viewBox="0 0 10 10" style="transform: rotate(${(dir + 180) % 360}deg)" aria-hidden="true"><path d="M5 1v8M2 4l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      windEl.append(`${compass} ${speed} km/h`)
    }
  } catch {
    el.dataset.state = 'offline'
    if (labelEl) labelEl.textContent = 'Sky data offline'
  }
}
