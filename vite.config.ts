import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '' : 'https://fruehwirth.github.io/Flag-Trainer/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}))