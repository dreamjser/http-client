import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HttpClient',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      output: {
        globals: {
          'node-fetch': 'fetch'
        }
      }
    }
  },
  plugins: [
    dts({
      include: ['src/index.ts', 'src/types.ts'],
      outDir: 'dist',
      insertTypesEntry: true,
      copyDtsFiles: false,
      cleanVueFileName: true,
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true
      }
    })
  ]
}) 