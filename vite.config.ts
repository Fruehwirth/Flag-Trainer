import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs-extra'

export default defineConfig({
  base: '/flag-trainer/',
  plugins: [
    react(),
    {
      name: 'copy-files',
      closeBundle: async () => {
        await fs.copy('public/404.html', 'dist/404.html')
        await fs.copy('public/200.html', 'dist/200.html')
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})