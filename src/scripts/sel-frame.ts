/**
 * Design-tool selection frames ([data-sel-frame]): keep the size
 * readout and breakpoint label live. The CSS intro animation resizes
 * the hero frame, so the numbers count up as it "drags" open.
 */
import { breakpointName } from './viewport'

export function initSelFrames(): void {
  const frames = document.querySelectorAll<HTMLElement>('[data-sel-frame]')
  if (frames.length === 0) return

  frames.forEach((frame) => {
    const dims = frame.querySelector('[data-sel-dims]')
    const label = frame.querySelector('[data-sel-label]')

    const update = (width: number, height: number): void => {
      if (dims) dims.textContent = `${Math.round(width)} × ${Math.round(height)}`
      if (label) label.textContent = breakpointName(window.innerWidth)
    }

    if (!('ResizeObserver' in window)) {
      const rect = frame.getBoundingClientRect()
      update(rect.width, rect.height)
      return
    }

    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.borderBoxSize?.[0]
        if (box) update(box.inlineSize, box.blockSize)
        else update(entry.contentRect.width, entry.contentRect.height)
      }
    }).observe(frame)
  })
}
