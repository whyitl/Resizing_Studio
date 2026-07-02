/**
 * Scroll-reveal: elements with .reveal get .is-visible when they
 * enter the viewport. Honors prefers-reduced-motion (CSS disables
 * the transition; we still add the class so nothing stays hidden).
 */

export function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal')
  if (targets.length === 0) return

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  )

  targets.forEach((el) => observer.observe(el))
}
