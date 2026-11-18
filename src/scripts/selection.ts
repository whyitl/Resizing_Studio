/**
 * Adaptive text-selection colors: ember highlight on light sections,
 * soft peach highlight on dark sections, based on effective background.
 */

interface SelectionTheme {
  bg: string
  fg: string
}

const SELECTION_LIGHT: SelectionTheme = { bg: '#ff6a3d', fg: '#14171c' }
const SELECTION_DARK: SelectionTheme = { bg: '#f3c9a4', fg: '#14171c' }

type Rgb = [number, number, number]

function parseRgb(color: string): Rgb | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function getEffectiveBackground(el: Element): string {
  let node: Element | null = el
  while (node && node !== document.documentElement) {
    const { backgroundColor } = getComputedStyle(node)
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return backgroundColor
    }
    node = node.parentElement
  }
  return getComputedStyle(document.body).backgroundColor
}

function setSelectionTheme(lightBackground: boolean): void {
  const theme = lightBackground ? SELECTION_LIGHT : SELECTION_DARK
  const root = document.documentElement
  root.style.setProperty('--selection-bg', theme.bg)
  root.style.setProperty('--selection-fg', theme.fg)
}

function updateSelectionTheme(): void {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    setSelectionTheme(true)
    return
  }

  let node: Node | null = selection.anchorNode
  if (!node) return
  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
  if (!element) return

  const rgb = parseRgb(getEffectiveBackground(element))
  if (!rgb) {
    setSelectionTheme(true)
    return
  }

  setSelectionTheme(relativeLuminance(rgb) > 0.55)
}

export function initSelectionTheme(): void {
  document.addEventListener('selectionchange', updateSelectionTheme)
}
