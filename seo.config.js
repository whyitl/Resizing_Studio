/** @type {import('./seo.config.js').SiteConfig} */
export const SITE = {
  name: 'Resizing Studio',
  url: 'https://www.resizing.ca',
  locale: 'en_CA',
  email: 'contact@resizing.ca',
  location: 'Calgary, Alberta',
}

/** @type {Record<string, import('./seo.config.js').PageSeo>} */
export const PAGES = {
  'index.html': {
    path: '/',
    title: 'Resizing Studio',
    description:
      'Thoughtful, effective websites for small businesses in Calgary. Web development, hosting, maintenance, and branding without the big agency price tag.',
    ogImage: '/og/home.jpg',
  },
  'contact.html': {
    path: '/contact',
    title: 'Contact — Resizing Studio',
    description:
      'Get in touch with Resizing Studio to discuss your brand, project, or collaboration. We would love to hear from you.',
    ogImage: '/og/contact.jpg',
  },
  'privacy-policy.html': {
    path: '/privacy-policy',
    title: 'Privacy Policy — Resizing Studio',
    description:
      'Read the Resizing Studio privacy policy to learn how we collect, use, and protect your personal information.',
    ogImage: '/og/default.jpg',
  },
  'terms.html': {
    path: '/terms',
    title: 'Terms of Service — Resizing Studio',
    description:
      'Review the Resizing Studio terms of service that govern the use of our website and services.',
    ogImage: '/og/default.jpg',
  },
  'accessibility.html': {
    path: '/accessibility',
    title: 'Accessibility Statement — Resizing Studio',
    description:
      'Resizing Studio is committed to digital accessibility. Read our accessibility statement and how to reach us with feedback.',
    ogImage: '/og/default.jpg',
  },
  '404.html': {
    path: '/404',
    title: 'Page Not Found — Resizing Studio',
    description: 'The page you are looking for could not be found.',
    ogImage: '/og/default.jpg',
    noindex: true,
  },
}

/**
 * @param {import('./seo.config.js').PageSeo} page
 * @returns {string}
 */
export function renderSeoHead(page) {
  const canonical = `${SITE.url}${page.path === '/' ? '/' : page.path}`
  const ogImage = `${SITE.url}${page.ogImage}`

  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />`,
    `<meta name="theme-color" content="#3b5249" />`,
    `<link rel="apple-touch-icon" href="/favicon.svg" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE.name)}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttr(page.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(page.description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<meta name="twitter:image:alt" content="${escapeAttr(page.title)}" />`,
  ]

  if (page.path === '/') {
    tags.push(
      `<link rel="preload" as="image" href="/Calgary_Sky.webp" type="image/webp" fetchpriority="high" />`,
    )
    tags.push(renderOrganizationJsonLd())
  }

  return tags.join('\n  ')
}

function renderOrganizationJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Calgary',
      addressRegion: 'AB',
      addressCountry: 'CA',
    },
    sameAs: [
      'https://www.linkedin.com/company/resizing/',
      'https://www.instagram.com/resizing',
    ],
  }
  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`
}

/** @param {string} value */
function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

/** @param {string} value */
function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

/**
 * @typedef {object} SiteConfig
 * @property {string} name
 * @property {string} url
 * @property {string} locale
 * @property {string} email
 * @property {string} location
 */

/**
 * @typedef {object} PageSeo
 * @property {string} path
 * @property {string} title
 * @property {string} description
 * @property {string} ogImage
 * @property {boolean} [noindex]
 */
