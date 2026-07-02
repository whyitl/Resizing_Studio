/**
 * FAQ accordion (details-based, one open at a time, animated close)
 * and expandable work rows (button + inert panel).
 */

function closeFaqItem(
  item: HTMLDetailsElement,
  { instant = false }: { instant?: boolean } = {},
): Promise<void> {
  if (!item.classList.contains('is-open')) return Promise.resolve()

  item.classList.remove('is-open')
  const summary = item.querySelector('summary')
  if (summary) summary.setAttribute('aria-expanded', 'false')
  if (instant) {
    item.removeAttribute('open')
    return Promise.resolve()
  }

  const panel = item.querySelector<HTMLElement>('.faq__panel')
  if (!panel) {
    item.removeAttribute('open')
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const onEnd = (e: TransitionEvent): void => {
      if (e.propertyName !== 'grid-template-rows') return
      panel.removeEventListener('transitionend', onEnd)
      item.removeAttribute('open')
      resolve()
    }
    panel.addEventListener('transitionend', onEnd)
  })
}

function openFaqItem(item: HTMLDetailsElement): void {
  item.setAttribute('open', '')
  const summary = item.querySelector('summary')
  if (summary) summary.setAttribute('aria-expanded', 'true')
  requestAnimationFrame(() => item.classList.add('is-open'))
}

export function initFaq(): void {
  const faqItems = Array.from(
    document.querySelectorAll<HTMLDetailsElement>('.faq__item'),
  )

  faqItems.forEach((item) => {
    const summary = item.querySelector('summary')
    if (!summary) return

    summary.addEventListener('click', (e) => {
      e.preventDefault()
      void (async () => {
        const isOpen = item.classList.contains('is-open')

        if (isOpen) {
          await closeFaqItem(item)
          return
        }

        await Promise.all(
          faqItems.filter((other) => other !== item).map((other) => closeFaqItem(other)),
        )
        openFaqItem(item)
      })()
    })
  })
}

function setWorkRowOpen(row: Element, open: boolean): void {
  const bar = row.querySelector('.wrow__bar')
  const panel = row.querySelector('.wrow__panel')
  row.classList.toggle('is-open', open)
  if (bar) bar.setAttribute('aria-expanded', open ? 'true' : 'false')
  if (panel) {
    if (open) panel.removeAttribute('inert')
    else panel.setAttribute('inert', '')
  }
}

export function initWorkRows(): void {
  const workRows = Array.from(document.querySelectorAll('.wrow'))

  workRows.forEach((row) => {
    const bar = row.querySelector<HTMLButtonElement>('.wrow__bar')
    const panel = row.querySelector('.wrow__panel')
    if (!bar || !panel) return

    const isOpen = row.classList.contains('is-open')
    if (isOpen) panel.removeAttribute('inert')
    else panel.setAttribute('inert', '')
    bar.setAttribute('aria-expanded', isOpen ? 'true' : 'false')

    bar.addEventListener('click', () => {
      const willOpen = !row.classList.contains('is-open')
      workRows.forEach((other) => setWorkRowOpen(other, false))
      if (willOpen) setWorkRowOpen(row, true)
    })
  })
}
