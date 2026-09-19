import { defineConfig } from 'vite'
import path from 'path'
import { execSync } from 'child_process'

// what the page's header shows, so a deployed copy can be told from the dev server and from an older deploy
const sh = (cmd) => { try { return execSync(cmd, { cwd: __dirname }).toString().trim() } catch (e) { return '' } }
const build = `${sh('git rev-parse --short HEAD') || 'nogit'}${sh('git status --porcelain -- dev src extensions') ? '+' : ''} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}Z`

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
  define: { 'global': '{}', __HERDER_BUILD__: JSON.stringify(build) }
})
