import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    outDir: 'dist/extensions',
    lib: {
      entry: path.resolve(__dirname, 'extensions/vertex/index.js'),
      name: 'HydraVertexExtension',
      fileName: (format) => `vertex.${format}.js`
    },
    rollupOptions: {
      // Don't bundle hydra-synth - it's a peer dependency
      external: ['hydra-synth'],
      output: {
        exports: 'named',
        globals: {
          'hydra-synth': 'Hydra'
        }
      }
    }
  },
  define: {
    'global': '{}'
  }
})
