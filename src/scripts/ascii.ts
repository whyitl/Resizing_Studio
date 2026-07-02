/** Footer ASCII wordmark: glitch scramble on hover (motion-safe). */

export function initAsciiGlitch(): void {
  const ascii = document.getElementById('ascii')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!ascii || prefersReducedMotion) return

  const original = ascii.textContent ?? ''
  const glyphs = '█▓▒░╗╝╔╚║═'
  let timer: ReturnType<typeof setInterval> | null = null

  const scramble = (): void => {
    let frame = 0
    const total = 6
    if (timer !== null) clearInterval(timer)
    timer = setInterval(() => {
      frame++
      ascii.textContent = original.replace(/[█▓▒░╗╝╔╚║═]/g, (ch) =>
        Math.random() < 0.18 ? (glyphs[(Math.random() * glyphs.length) | 0] ?? ch) : ch,
      )
      if (frame >= total) {
        if (timer !== null) clearInterval(timer)
        ascii.textContent = original
      }
    }, 45)
  }

  ascii.addEventListener('pointerenter', scramble)
}
