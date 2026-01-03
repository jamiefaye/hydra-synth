import { defineConfig } from 'vite'
import path from 'path'

// Get build target from environment or default to 'webgl'
const target = process.env.EXT_TARGET || process.env.VERTEX_TARGET || 'webgl'

const configs = {
  webgl: {
    entry: path.resolve(__dirname, 'extensions/vertex/index.js'),
    name: 'HydraVertexExtension',
    outDir: 'dist/extensions/vertex',
    fileName: (format) => format === 'es' ? 'index.js' : `index.${format}.js`
  },
  webgpu: {
    entry: path.resolve(__dirname, 'extensions/vertex/index-webgpu.js'),
    name: 'HydraVertexExtensionWebGPU',
    outDir: 'dist/extensions/vertex-webgpu',
    fileName: (format) => format === 'es' ? 'index.js' : `index.${format}.js`
  },
  inact: {
    entry: path.resolve(__dirname, 'extensions/inact/index.js'),
    name: 'HydraInActExtension',
    outDir: 'dist/extensions/inact',
    fileName: (format) => format === 'es' ? 'index.js' : `index.${format}.js`
  }
}

const config = configs[target]

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    outDir: config.outDir,
    emptyOutDir: true,  // Clear target dir for clean builds
    lib: {
      entry: config.entry,
      name: config.name,
      fileName: config.fileName
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
