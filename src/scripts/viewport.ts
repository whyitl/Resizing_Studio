/**
 * Viewport helpers + the footer "Your viewport" readout.
 * Fitting for a studio called Resizing: resize the window and watch it.
 */

export function breakpointName(width: number): string {
  if (width < 600) return 'Mobile'
  if (width < 960) return 'Tablet'
  if (width < 1600) return 'Desktop'
  return 'Wide'
}

export function initViewportReadout(): void {
  const el = document.getElementById('viewport')
  if (!el) return

  const sizeEl = el.querySelector('[data-vp-size]')
  const bpEl = el.querySelector('[data-vp-bp]')
  const dprEl = el.querySelector('[data-vp-dpr]')

  const render = (): void => {
    if (sizeEl) sizeEl.textContent = `${window.innerWidth} × ${window.innerHeight}`
    if (bpEl) bpEl.textContent = breakpointName(window.innerWidth)
    if (dprEl) dprEl.textContent = `@${Number(window.devicePixelRatio.toFixed(2))}x`
  }
  render()

  let lastWidth = window.innerWidth
  let raf = 0
  let settle: ReturnType<typeof setTimeout> | undefined

  window.addEventListener(
    'resize',
    () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (sizeEl) sizeEl.textContent = `${window.innerWidth} × ${window.innerHeight}`
      })

      // Only flash for real width changes (mobile URL bars resize height on scroll)
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      el.classList.add('is-resizing')
      if (bpEl) bpEl.textContent = 'Resizing…'
      clearTimeout(settle)
      settle = setTimeout(() => {
        el.classList.remove('is-resizing')
        render()
      }, 650)
    },
    { passive: true },
  )
}
