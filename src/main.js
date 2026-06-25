// ===== Console Easter egg =====
console.log(
  `%c
██████╗ ███████╗███████╗██╗███████╗██╗███╗   ██╗ ██████╗
██╔══██╗██╔════╝██╔════╝██║╚══███╔╝██║████╗  ██║██╔════╝
██████╔╝█████╗  ███████╗██║  ███╔╝ ██║██╔██╗ ██║██║  ███╗
██╔══██╗██╔══╝  ╚════██║██║ ███╔╝  ██║██║╚██╗██║██║   ██║
██║  ██║███████╗███████║██║███████╗██║██║ ╚████║╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝

Built with care :)
 /\\_/\\
( o.o )
 > ^ <
`,
  'font-family: monospace; line-height: 1.2;'
);

// ===== Adaptive text selection colors =====
const SELECTION_LIGHT = { bg: '#3b5249', fg: '#ffffff' };
const SELECTION_DARK = { bg: '#ffffff', fg: '#141716' };

function parseRgb(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([r, g, b]) {
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function getEffectiveBackground(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    const { backgroundColor } = getComputedStyle(node);
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return backgroundColor;
    }
    node = node.parentElement;
  }
  return getComputedStyle(document.body).backgroundColor;
}

function setSelectionTheme(lightBackground) {
  const theme = lightBackground ? SELECTION_LIGHT : SELECTION_DARK;
  const root = document.documentElement;
  root.style.setProperty('--selection-bg', theme.bg);
  root.style.setProperty('--selection-fg', theme.fg);
}

function updateSelectionTheme() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    setSelectionTheme(true);
    return;
  }

  let node = selection.anchorNode;
  if (!node) return;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  if (!node) return;

  const rgb = parseRgb(getEffectiveBackground(node));
  if (!rgb) {
    setSelectionTheme(true);
    return;
  }

  setSelectionTheme(relativeLuminance(rgb) > 0.55);
}

document.addEventListener('selectionchange', updateSelectionTheme);

// ===== Mobile nav: dropdown toggle =====
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.getElementById('primary-nav');
if (navToggle && navLinks) {
  const setNavOpen = (open) => {
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a destination
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) setNavOpen(false);
  });

  // Close on outside click or Escape
  document.addEventListener('click', (e) => {
    if (
      navToggle.getAttribute('aria-expanded') === 'true' &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setNavOpen(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavOpen(false);
      navToggle.focus();
    }
  });
}

// ===== Live clock =====
const CALGARY_TZ = 'America/Edmonton';

function getCalgaryHour() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CALGARY_TZ,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === 'hour').value);
}

function isCalgaryWorkingHours() {
  const hour = getCalgaryHour();
  return hour >= 9 && hour < 16;
}

function updateClock() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CALGARY_TZ,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(new Date());

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '12';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const second = parts.find((p) => p.type === 'second')?.value ?? '00';
  const period = (parts.find((p) => p.type === 'dayPeriod')?.value ?? 'AM').toUpperCase();
  const hh = hour.padStart(2, '0');

  const el = document.getElementById('clock');
  if (!el) return;

  const timeEl = el.querySelector('.nav__clock-time');
  if (timeEl) timeEl.textContent = `${hh}:${minute}:${second} ${period}`;

  const working = isCalgaryWorkingHours();
  el.dataset.working = working ? 'true' : 'false';

  const labelEl = el.querySelector('.nav__clock-label');
  if (labelEl) labelEl.textContent = working ? 'Working' : 'Recharging';
}
updateClock();
setInterval(updateClock, 1000);

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Calgary weather (footer) =====
const CALGARY_LAT = 51.0447;
const CALGARY_LON = -114.0719;

const WEATHER_ICONS = {
  sunny: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 14.5A4.5 4.5 0 0 0 9.5 11 5 5 0 1 0 6 19.5h12A3.5 3.5 0 0 0 18 14.5z"/></svg>',
  rainy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13.5A4.5 4.5 0 0 0 9.5 10 5 5 0 1 0 6 18.5h12A3.5 3.5 0 0 0 18 13.5z"/><path d="M8 20v2M12 20v2M16 20v2"/></svg>',
};

const WEATHER_LABELS = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
};

function weatherCondition(code) {
  if (code === 0) return 'sunny';
  if ([1, 2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code)) return 'cloudy';
  return 'rainy';
}

async function updateCalgaryWeather() {
  const el = document.getElementById('weather');
  if (!el) return;

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', CALGARY_LAT);
    url.searchParams.set('longitude', CALGARY_LON);
    url.searchParams.set('current', 'temperature_2m,weather_code');
    url.searchParams.set('temperature_unit', 'celsius');

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return;

    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const condition = weatherCondition(data.current.weather_code);
    const label = WEATHER_LABELS[condition];

    const iconEl = el.querySelector('.footer__weather-icon');
    const tempEl = el.querySelector('.footer__weather-temp');
    const labelEl = el.querySelector('.footer__weather-label');

    if (iconEl) iconEl.innerHTML = WEATHER_ICONS[condition];
    if (tempEl) tempEl.textContent = `${temp}°C`;
    if (labelEl) labelEl.textContent = label;
    el.setAttribute('aria-label', `Calgary weather: ${temp} degrees Celsius, ${label}`);
  } catch {
    // Leave placeholder if the weather API is unavailable
  }
}

updateCalgaryWeather();

// ===== Dynamic quarter based on current month =====
const quarterEl = document.getElementById('quarter');
if (quarterEl) {
  const month = new Date().getMonth(); // 0–11
  const quarter = Math.floor(month / 3) + 1;
  quarterEl.textContent = `Q${quarter}`;
}

// ===== FAQ: smooth accordion, only one open at a time =====
const faqItems = Array.from(document.querySelectorAll('.faq__item'));

function closeFaqItem(item, { instant = false } = {}) {
  if (!item.classList.contains('is-open')) return Promise.resolve();

  item.classList.remove('is-open');
  const summary = item.querySelector('summary');
  if (summary) summary.setAttribute('aria-expanded', 'false');
  if (instant) {
    item.removeAttribute('open');
    return Promise.resolve();
  }

  const panel = item.querySelector('.faq__panel');
  return new Promise((resolve) => {
    const onEnd = (e) => {
      if (e.propertyName !== 'grid-template-rows') return;
      panel.removeEventListener('transitionend', onEnd);
      item.removeAttribute('open');
      resolve();
    };
    panel.addEventListener('transitionend', onEnd);
  });
}

function openFaqItem(item) {
  item.setAttribute('open', '');
  const summary = item.querySelector('summary');
  if (summary) summary.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => item.classList.add('is-open'));
}

faqItems.forEach((item) => {
  const summary = item.querySelector('summary');
  if (!summary) return;

  summary.addEventListener('click', async (e) => {
    e.preventDefault();
    const isOpen = item.classList.contains('is-open');

    if (isOpen) {
      await closeFaqItem(item);
      return;
    }

    await Promise.all(
      faqItems
        .filter((other) => other !== item)
        .map((other) => closeFaqItem(other))
    );
    openFaqItem(item);
  });
});

// ===== Showcased work: expandable rows (one open at a time) =====
const workRows = Array.from(document.querySelectorAll('.wrow'));

function setWorkRowOpen(row, open) {
  const bar = row.querySelector('.wrow__bar');
  const panel = row.querySelector('.wrow__panel');
  row.classList.toggle('is-open', open);
  if (bar) bar.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (panel) {
    if (open) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');
  }
}

workRows.forEach((row) => {
  const bar = row.querySelector('.wrow__bar');
  const panel = row.querySelector('.wrow__panel');
  if (!bar || !panel) return;

  const isOpen = row.classList.contains('is-open');
  if (isOpen) panel.removeAttribute('inert');
  else panel.setAttribute('inert', '');
  bar.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

  bar.addEventListener('click', () => {
    const willOpen = !row.classList.contains('is-open');
    workRows.forEach((other) => setWorkRowOpen(other, false));
    if (willOpen) setWorkRowOpen(row, true);
  });
});

// ===== Footer: ASCII wordmark glitch on hover =====
const ascii = document.getElementById('ascii');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (ascii && !prefersReducedMotion) {
  const original = ascii.textContent;
  const glyphs = '█▓▒░╗╝╔╚║═';
  let timer = null;

  function scramble() {
    let frame = 0;
    const total = 6;
    clearInterval(timer);
    timer = setInterval(() => {
      frame++;
      ascii.textContent = original.replace(/[█▓▒░╗╝╔╚║═]/g, (ch) =>
        Math.random() < 0.18 ? glyphs[(Math.random() * glyphs.length) | 0] : ch
      );
      if (frame >= total) {
        clearInterval(timer);
        ascii.textContent = original;
      }
    }, 45);
  }

  ascii.addEventListener('pointerenter', scramble);
}

// ===== Contact form: mailto =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const statusEl = document.getElementById('contact-status');

  function fieldValue(name) {
    const el = contactForm.querySelector(`[name="${CSS.escape(name)}"]`);
    if (!el) return '—';
    if (el instanceof HTMLSelectElement) {
      const option = el.options[el.selectedIndex];
      return option?.value ? option.textContent.trim() : '—';
    }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const value = el.value.trim();
      return value || '—';
    }
    return '—';
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) {
      if (statusEl) {
        statusEl.textContent = 'Please complete the required fields before sending.';
      }
      return;
    }

    const name = fieldValue('full-name');
    const reason = fieldValue('reason');
    const subject = encodeURIComponent(`Website enquiry: ${reason} - ${name}`);
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
      ].join('\n')
    );

    const mailto = `mailto:contact@resizing.ca?subject=${subject}&body=${body}`;

    if (mailto.length > 2000) {
      if (statusEl) {
        statusEl.textContent =
          'Your message is too long to open in email automatically. Shorten it or email contact@resizing.ca directly.';
      }
      return;
    }

    window.location.href = mailto;

    if (statusEl) {
      statusEl.textContent = 'Opening your email client with your message…';
    }
  });
}
