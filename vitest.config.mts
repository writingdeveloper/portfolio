import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    // Keep git worktrees under .claude/ from being scanned as a second copy
    // of the suite.
    exclude: ['**/node_modules/**', '**/.claude/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})
