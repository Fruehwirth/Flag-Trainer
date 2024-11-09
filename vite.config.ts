import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '' : '/flag-trainer/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}))