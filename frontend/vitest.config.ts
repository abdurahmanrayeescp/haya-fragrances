import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // Node is perfect and fast for testing Zustand stores
  },
});
