import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    // Keep git worktrees under .claude/ from being scanned as a second copy
    // of the suite.
    exclude: ['**/node_modules/**', '**/.claude/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
