import { defineConfig } from 'vite'
import path from 'path'

// Static build of the Herder page for hosting (e.g. https://www.fentonia.com/herder/).
// Serves from any static host; needs HTTPS for Web MIDI and the camera.
export default defineConfig({
  root: path.resolve(__dirname, 'dev'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/herder'),
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: { herder: path.resolve(__dirname, 'dev/herder.html'), manual: path.resolve(__dirname, 'dev/manual.html') }
    }
  },
  define: { 'global': '{}' }
})
