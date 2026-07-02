/** Mobile nav: dropdown toggle with escape / outside-click dismissal. */

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
