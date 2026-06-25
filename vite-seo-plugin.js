import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGES, renderSeoHead } from './seo.config.js'

const root = fileURLToPath(new URL('.', import.meta.url))

/** Inject canonical URLs, Open Graph, Twitter Card, and JSON-LD from seo.config.js */
export function injectSeo() {
  return {
    name: 'inject-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const filename = ctx.filename.split(/[/\\]/).pop()
        const page = PAGES[filename]
        if (!page) return html

        const seoBlock = renderSeoHead(page)

        let result = html
          .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
          .replace(/<meta\s+name="description"[^>]*>\s*/i, '')

        result = result.replace(
          /<meta\s+name="viewport"[^>]*>\s*/i,
          (match) => `${match}  ${seoBlock}\n  `,
        )

        return result
      },
    },
  }
}

export { SITE, PAGES } from './seo.config.js'
