import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import path from "path";
//import path = require('path')
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
   worker: {
   rollupOptions: {
      output: {
        inlineDynamicImports : true,
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
   build: {
  	minify: false,
  	terserOptions: {
      compress: false,
      mangle: false,
    },
    
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'hydra-synth',
      fileName: (format) => `hydra-synth.${format}.js`
    }
  },

  	  base: './',
	    define: {
        // "process.env": process.env,
        // // By default, Vite doesn't include shims for NodeJS/
        // // necessary for segment analytics lib to work
        "global": {},
    	},
	/* uncomment this block to enable https. You may need to change some settings so this will actually work in Chrome. */
	  server: {
	  port: 8000,
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/certificate.pem'),
    },
  },
  	preview: {
	  port: 8000,
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/certificate.pem'),
    },
  },

  plugins: [
 {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    }
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
