/** Calgary weather widget in the footer (Open-Meteo, no key). */

const CALGARY_LAT = 51.0447
const CALGARY_LON = -114.0719

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'

const WEATHER_ICONS: Record<WeatherCondition, string> = {
  sunny:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  cloudy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 14.5A4.5 4.5 0 0 0 9.5 11 5 5 0 1 0 6 19.5h12A3.5 3.5 0 0 0 18 14.5z"/></svg>',
  rainy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13.5A4.5 4.5 0 0 0 9.5 10 5 5 0 1 0 6 18.5h12A3.5 3.5 0 0 0 18 13.5z"/><path d="M8 20v2M12 20v2M16 20v2"/></svg>',
}

const WEATHER_LABELS: Record<WeatherCondition, string> = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    weather_code: number
  }
}

function weatherCondition(code: number): WeatherCondition {
  if (code === 0) return 'sunny'
  if ([1, 2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code)) return 'cloudy'
  return 'rainy'
}

export async function initWeather(): Promise<void> {
  const el = document.getElementById('weather')
  if (!el) return

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(CALGARY_LAT))
    url.searchParams.set('longitude', String(CALGARY_LON))
    url.searchParams.set('current', 'temperature_2m,weather_code')
    url.searchParams.set('temperature_unit', 'celsius')

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return

    const data = (await res.json()) as OpenMeteoResponse
    const temp = Math.round(data.current.temperature_2m)
    const condition = weatherCondition(data.current.weather_code)
    const label = WEATHER_LABELS[condition]

    const iconEl = el.querySelector('.footer__weather-icon')
    const tempEl = el.querySelector('.footer__weather-temp')
    const labelEl = el.querySelector('.footer__weather-label')

    if (iconEl) iconEl.innerHTML = WEATHER_ICONS[condition]
    if (tempEl) tempEl.textContent = `${temp}°C`
    if (labelEl) labelEl.textContent = label
    el.setAttribute('aria-label', `Calgary weather: ${temp} degrees Celsius, ${label}`)
  } catch {
    // Leave the placeholder if the weather API is unavailable
  }
}
