import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    reporters: ['default', ['html', { outputFile: './public/test-results/integration/index.html' }]],
    include: ['src/**/*.n8n.integration.test.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
