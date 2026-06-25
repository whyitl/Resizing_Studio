import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { injectSeo } from './vite-seo-plugin.js'

const root = fileURLToPath(new URL('.', import.meta.url))

function cleanUrls() {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next()
        const [pathname, search = ''] = req.url.split('?')
        if (
          pathname !== '/' &&
          !pathname.includes('.') &&
          !pathname.endsWith('/')
        ) {
          req.url = `${pathname}.html${search ? `?${search}` : ''}`
        }
        next()
      })
    },
  }
}

export default defineConfig({
  root: 'src',
  plugins: [cleanUrls(), injectSeo()],
  build: {
    target: 'es2020',
    outDir: '../dist',
    emptyOutDir: true,
    cssMinify: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        index: resolve(root, 'src/index.html'),
        contact: resolve(root, 'src/contact.html'),
        privacy: resolve(root, 'src/privacy-policy.html'),
        terms: resolve(root, 'src/terms.html'),
        accessibility: resolve(root, 'src/accessibility.html'),
        notFound: resolve(root, 'src/404.html'),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
