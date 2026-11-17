import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createRequire } from 'node:module'
import { cpSync, createReadStream, statSync } from 'node:fs'
import path from 'node:path'

/*
 * pdf.js braucht zur Laufzeit ein paar Zusatzdateien, die nicht ins Bundle gehören:
 *   wasm/            – Decoder für Scans (JBIG2, JPEG 2000) und Farbprofile
 *   cmaps/           – Zeichentabellen für nicht eingebettete Schriften
 *   standard_fonts/  – die 14 PDF-Standardschriften
 *   iccs/            – ICC-Farbprofile
 * Im Dev-Server werden sie unter /pdfjs/ ausgeliefert, beim Build nach dist/pdfjs/ kopiert.
 */
const pdfjsDir = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'))
const PDFJS_ORDNER = ['wasm', 'cmaps', 'standard_fonts', 'iccs']
const MIME = { '.wasm': 'application/wasm', '.js': 'text/javascript' }

function pdfjsDateien() {
  return {
    name: 'pdfjs-dateien',
    configureServer(server) {
      server.middlewares.use('/pdfjs', (req, res, next) => {
        const relativ = decodeURIComponent(req.url.split('?')[0])
        const datei = path.join(pdfjsDir, relativ)
        const ordner = relativ.split('/')[1]
        // Nur Dateien aus den freigegebenen Ordnern ausliefern
        if (!PDFJS_ORDNER.includes(ordner) || !datei.startsWith(path.join(pdfjsDir, ordner) + path.sep)) return next()
        try {
          if (!statSync(datei).isFile()) return next()
        } catch {
          return next()
        }
        res.setHeader('Content-Type', MIME[path.extname(datei)] ?? 'application/octet-stream')
        createReadStream(datei).pipe(res)
      })
    },
    writeBundle(options) {
      for (const ordner of PDFJS_ORDNER) {
        cpSync(path.join(pdfjsDir, ordner), path.join(options.dir, 'pdfjs', ordner), { recursive: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pdfjsDateien()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
