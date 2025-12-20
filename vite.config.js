import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'

const httpsConfig = fs.existsSync('./certs/key.pem') ? {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/certificate.pem'),
} : undefined

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'Hydra',
      fileName: (format) => `hydra-synth.${format}.js`
    },
    rollupOptions: {
      output: {
        exports: 'default'
      }
    }
  },
  define: {
    'global': '{}'
  },
  server: {
    port: 8000,
    https: httpsConfig,
  },
  preview: {
    port: 8000,
    https: httpsConfig,
  }
})
