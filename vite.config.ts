import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = process.env.CI_PROJECT_NAME ? `/${process.env.CI_PROJECT_NAME}/` : '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
})
