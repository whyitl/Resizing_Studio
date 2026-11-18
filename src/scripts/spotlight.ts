/** Pointer-following glow on cards ([data-spotlight], telemetry cells). */

export function initSpotlights(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  document.querySelectorAll<HTMLElement>('[data-spotlight], .tele').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      el.style.setProperty('--my', `${e.clientY - rect.top}px`)
    })
  })
}
