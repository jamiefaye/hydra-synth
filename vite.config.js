import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'global': 'globalThis',
  },
  server: {
    port: 8000,
    open: '/dev/test-webgl.html',
  },
  build: {
    lib: {
      entry: './src/hydra-synth.js',
      name: 'Hydra',
      fileName: 'hydra-synth',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['regl'],
      output: {
        globals: {
          regl: 'createREGL'
        }
      }
    }
  }
})
