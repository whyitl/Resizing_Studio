/** Footer build stamp: short commit SHA + build date, injected by Vite. */

export function initBuildInfo(): void {
  const shaEl = document.getElementById('build-sha')
  const dateEl = document.getElementById('build-date')

  if (typeof __BUILD_SHA__ === 'undefined') return

  if (shaEl) shaEl.textContent = __BUILD_SHA__
  if (dateEl && typeof __BUILD_DATE__ !== 'undefined') {
    const built = new Date(__BUILD_DATE__)
    if (!Number.isNaN(built.getTime())) {
      dateEl.textContent = `· ${new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Edmonton',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(built)}`
    }
  }
}
