/**
 * Nav: mobile dropdown (escape / outside-click dismissal), a "scrolled"
 * state for the glass pills, and a scrollspy dot on in-page links.
 */

export function initNav(): void {
  const navToggle = document.querySelector<HTMLButtonElement>('.nav__toggle')
  const navLinks = document.getElementById('primary-nav')
  if (!navToggle || !navLinks) return

  const setNavOpen = (open: boolean): void => {
    navLinks.classList.toggle('is-open', open)
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  }

  const isOpen = (): boolean => navToggle.getAttribute('aria-expanded') === 'true'

  navToggle.addEventListener('click', () => {
    setNavOpen(!isOpen())
  })

  // Close after choosing a destination
  navLinks.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) setNavOpen(false)
  })

  document.addEventListener('click', (e) => {
    if (
      isOpen() &&
      e.target instanceof Node &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setNavOpen(false)
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setNavOpen(false)
      navToggle.focus()
    }
  })
}

export function initNavScrollState(): void {
  const nav = document.querySelector<HTMLElement>('.nav')
  if (!nav) return

  let ticking = false
  const update = (): void => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12)
    ticking = false
  }
  update()
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    },
    { passive: true },
  )
}

export function initScrollSpy(): void {
  if (!('IntersectionObserver' in window)) return

  const links = new Map<Element, HTMLAnchorElement>()
  document.querySelectorAll<HTMLAnchorElement>('#primary-nav a[href^="/#"]').forEach((link) => {
    const id = link.getAttribute('href')?.slice(2)
    const section = id ? document.getElementById(id) : null
    if (section) links.set(section, link)
  })
  if (links.size === 0) return

  const visible = new Set<Element>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      // The first section (in document order) crossing the reading line wins
      let active: Element | undefined
      for (const section of links.keys()) {
        if (visible.has(section)) {
          active = section
          break
        }
      }
      links.forEach((link, section) => link.classList.toggle('is-active', section === active))
    },
    { rootMargin: '-40% 0px -55% 0px' },
  )
  links.forEach((_, section) => observer.observe(section))
}
