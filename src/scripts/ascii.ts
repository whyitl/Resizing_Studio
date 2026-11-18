/**
 * Footer ASCII wordmark.
 *  - Fitted: font-size is solved so the 64-column art spans the footer.
 *  - Lens: blocks near the cursor dissolve into lighter shades (▓▒░)
 *    with a dotted ring at the lens edge, eased so it trails the pointer.
 *  - Ripples: click / tap sends a shockwave through the letters.
 * Motion-safe: with prefers-reduced-motion the art is just fitted.
 */

const SHADES = ['▓', '▒', '░'] as const
const BOX = /[╗╝╔╚║═]/
const LENS_RADIUS = 7.5 // in columns
const RIPPLE_SPEED = 46 // columns per second
const RIPPLE_WIDTH = 1.6

interface Ripple {
  col: number
  row: number
  start: number
}

export function initAscii(): void {
  const ascii = document.getElementById('ascii')
  const container = ascii?.parentElement
  if (!ascii || !container) return

  const original = ascii.textContent ?? ''
  const lines = original.split('\n')
  const cols = Math.max(...lines.map((l) => l.length))
  const rows = lines.length

  /* ----- Fit to width ----- */
  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.textContent = '█'.repeat(20)
  probe.style.cssText =
    'position:absolute;visibility:hidden;white-space:pre;font-family:var(--font-ascii);font-size:100px;line-height:1;'
  container.append(probe)

  let charW = 0
  let rowH = 0

  const fit = (): void => {
    const advance = probe.getBoundingClientRect().width / 20 / 100 // em per char
    if (!advance) return
    const available = container.clientWidth
    const size = Math.min(48, Math.max(5, (available / (cols * advance)) * 0.995))
    ascii.style.fontSize = `${size.toFixed(2)}px`
    const rect = ascii.getBoundingClientRect()
    charW = advance * size
    rowH = rect.height / rows
  }

  fit()
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(container)
  void document.fonts?.ready.then(fit)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  /* ----- Lens + ripples ----- */
  const target = { col: -100, row: -100 }
  const lens = { col: -100, row: -100, r: 0 }
  let inside = false
  let ripples: Ripple[] = []
  let frame = 0

  const toGrid = (clientX: number, clientY: number): { col: number; row: number } => {
    const rect = ascii.getBoundingClientRect()
    return { col: (clientX - rect.left) / charW, row: (clientY - rect.top) / rowH }
  }

  const render = (now: number): void => {
    // Ease the lens toward the pointer and grow/shrink its radius
    lens.col += (target.col - lens.col) * 0.22
    lens.row += (target.row - lens.row) * 0.22
    lens.r += ((inside ? LENS_RADIUS : 0) - lens.r) * 0.16

    ripples = ripples.filter((r) => (now - r.start) / 1000 * RIPPLE_SPEED < cols + 10)

    const aspect = rowH / charW || 1.7
    let out = ''
    for (let y = 0; y < rows; y++) {
      const line = lines[y] ?? ''
      for (let x = 0; x < line.length; x++) {
        const ch = line[x] ?? ' '
        const cx = x + 0.5
        const cy = (y + 0.5) * aspect

        // Lens influence: 1 at centre → 0 at the rim
        let influence = 0
        if (lens.r > 0.3) {
          const d = Math.hypot(cx - lens.col, cy - lens.row * aspect)
          influence = Math.max(0, 1 - d / lens.r)
        }

        // Ripple ring
        let wave = false
        for (const r of ripples) {
          const radius = ((now - r.start) / 1000) * RIPPLE_SPEED
          const d = Math.hypot(cx - r.col, cy - r.row * aspect)
          if (Math.abs(d - radius) < RIPPLE_WIDTH) {
            wave = true
            break
          }
        }

        if (ch === '█') {
          if (wave) out += '░'
          else if (influence > 0) out += SHADES[Math.min(2, Math.floor(influence * 3))] ?? ch
          else out += ch
        } else if (BOX.test(ch)) {
          out += wave || influence > 0.45 ? '·' : ch
        } else if (ch === ' ') {
          out += wave || (influence > 0.06 && influence < 0.2) ? '·' : ' '
        } else {
          out += ch
        }
      }
      if (y < rows - 1) out += '\n'
    }
    ascii.textContent = out

    // Fully released: restore the pristine art and stop
    if (!inside && lens.r < 0.3 && ripples.length === 0) {
      ascii.textContent = original
      frame = 0
      return
    }
    // Hovering but the lens has caught up: idle until the pointer moves
    const resting =
      inside &&
      ripples.length === 0 &&
      Math.abs(target.col - lens.col) < 0.02 &&
      Math.abs(target.row - lens.row) < 0.02 &&
      LENS_RADIUS - lens.r < 0.02
    frame = resting ? 0 : requestAnimationFrame(render)
  }

  const wake = (): void => {
    if (!frame) frame = requestAnimationFrame(render)
  }

  ascii.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return
    const p = toGrid(e.clientX, e.clientY)
    target.col = p.col
    target.row = p.row
    if (lens.r < 0.3) {
      lens.col = p.col
      lens.row = p.row
    }
    inside = true
    wake()
  })
  ascii.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    const p = toGrid(e.clientX, e.clientY)
    target.col = p.col
    target.row = p.row
    wake()
  })
  ascii.addEventListener('pointerleave', () => {
    inside = false
    wake()
  })
  ascii.addEventListener('pointerdown', (e) => {
    const p = toGrid(e.clientX, e.clientY)
    ripples.push({ col: p.col, row: p.row, start: performance.now() })
    wake()
  })
}
