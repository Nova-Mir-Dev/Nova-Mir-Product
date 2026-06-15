import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json-summary'],
      include: [
        'src/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'emails/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/__tests__/**',
        '**/api/**',
        '**/bootstrapper/**',
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: /^@\/lib\/(.*)/,
        replacement: path.resolve(__dirname, 'src/lib/$1'),
      },
      {
        find: /^@\/emails\/(.*)/,
        replacement: path.resolve(__dirname, 'emails/$1'),
      },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
    ],
  },
})
