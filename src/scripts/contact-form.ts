/** Contact form: validate, then hand off to the visitor's mail client. */

export function initContactForm(): void {
  const contactForm = document.getElementById('contact-form')
  if (!(contactForm instanceof HTMLFormElement)) return

  const statusEl = document.getElementById('contact-status')

  const setStatus = (message: string, state: 'ok' | 'error' = 'ok'): void => {
    if (!statusEl) return
    statusEl.textContent = message
    statusEl.dataset.state = state
  }

  const fieldValue = (name: string): string => {
    const el = contactForm.querySelector(`[name="${CSS.escape(name)}"]`)
    if (!el) return '—'
    if (el instanceof HTMLSelectElement) {
      const option = el.options[el.selectedIndex]
      return option?.value ? (option.textContent ?? '').trim() : '—'
    }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return el.value.trim() || '—'
    }
    return '—'
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!contactForm.reportValidity()) {
      setStatus('A few required fields still need attention — they’re marked above.', 'error')
      return
    }

    const name = fieldValue('full-name')
    const reason = fieldValue('reason')
    const subject = encodeURIComponent(`Website enquiry: ${reason} - ${name}`)
    const body = encodeURIComponent(
      [
        'New contact form submission',
        '',
        '- How can we help? -',
        `Reason for enquiry: ${reason}`,
        '',
        '- About you -',
        `Full name: ${name}`,
        `Position: ${fieldValue('position')}`,
        `Email: ${fieldValue('email')}`,
        `Website: ${fieldValue('website')}`,
        '',
        '- About your business -',
        `Business name: ${fieldValue('business-name')}`,
        `What they do: ${fieldValue('business-desc')}`,
        `Location: ${fieldValue('location')}`,
        `Operating: ${fieldValue('operating')}`,
        `Budget: ${fieldValue('budget')}`,
        '',
        '- Additional information -',
        fieldValue('message'),
      ].join('\n'),
    )

    const mailto = `mailto:contact@resizing.ca?subject=${subject}&body=${body}`

    if (mailto.length > 2000) {
      setStatus(
        'That message is a little long for an automatic email hand-off. Trim it down, or email contact@resizing.ca directly.',
        'error',
      )
      return
    }

    window.location.href = mailto
    setStatus('Opening your email app with everything filled in…')
  })
}
