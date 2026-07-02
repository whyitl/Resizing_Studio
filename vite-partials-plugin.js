import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const partialsDir = resolve(root, 'src/partials')

/**
 * Matches `<!-- @partial name {"key":"value"} -->` (params optional).
 * Each partial lives at src/partials/<name>.html and may contain
 * `{{key}}` placeholders that resolve to the supplied params (or '').
 */
const PARTIAL_RE = /<!--\s*@partial\s+([\w-]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g

function renderPartial(name, params) {
  const file = resolve(partialsDir, `${name}.html`)
  const template = readFileSync(file, 'utf8')
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? '')
}

/** Inline shared HTML partials (nav, footer) at build/serve time. */
export function injectPartials() {
  return {
    name: 'inject-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(PARTIAL_RE, (_, name, json) => {
          const params = json ? JSON.parse(json) : {}
          return renderPartial(name, params)
        })
      },
    },
    configureServer(server) {
      server.watcher.add(partialsDir)
      server.watcher.on('change', (file) => {
        if (file.startsWith(partialsDir)) {
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}
