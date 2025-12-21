import { defineConfig } from 'vite'
import path from 'path'

// Get build target from environment or default to 'webgl'
const target = process.env.VERTEX_TARGET || 'webgl'

const configs = {
  webgl: {
    entry: path.resolve(__dirname, 'extensions/vertex/index.js'),
    name: 'HydraVertexExtension',
    fileName: (format) => `vertex-webgl.${format}.js`
  },
  webgpu: {
    entry: path.resolve(__dirname, 'extensions/vertex/index-webgpu.js'),
    name: 'HydraVertexExtensionWebGPU',
    fileName: (format) => `vertex-webgpu.${format}.js`
  }
}

const config = configs[target]

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    outDir: 'dist/extensions',
    emptyOutDir: false,  // Don't clear between builds
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
