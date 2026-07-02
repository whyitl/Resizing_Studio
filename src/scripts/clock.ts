/** Live Calgary clock with in-studio/recharging status. */

const CALGARY_TZ = 'America/Edmonton'

function getCalgaryHour(): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CALGARY_TZ,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
}

function isCalgaryWorkingHours(): boolean {
  const hour = getCalgaryHour()
  return hour >= 9 && hour < 16
}

function updateClock(): void {
  const el = document.getElementById('clock')
  if (!el) return

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CALGARY_TZ,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(new Date())

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '12'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  const second = parts.find((p) => p.type === 'second')?.value ?? '00'
  const period = (parts.find((p) => p.type === 'dayPeriod')?.value ?? 'AM').toUpperCase()

  const timeEl = el.querySelector('.nav__clock-time')
  if (timeEl) timeEl.textContent = `${hour.padStart(2, '0')}:${minute}:${second} ${period}`

  const working = isCalgaryWorkingHours()
  el.dataset.working = working ? 'true' : 'false'

  const labelEl = el.querySelector('.nav__clock-label')
  if (labelEl) labelEl.textContent = working ? 'In studio' : 'Recharging'
}

export function initClock(): void {
  updateClock()
  setInterval(updateClock, 1000)
}
