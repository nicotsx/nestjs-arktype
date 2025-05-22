import swc from 'unplugin-swc';
import { type Plugin, defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: needed for vitest config
export default defineConfig({
  plugins: [swc.vite()] as Plugin[],
  test: {
    include: ['lib/**/*.test.ts'],
    coverage: { all: true, reporter: ['lcov', 'text-summary'] },
    reporters: ['default'],
    env: {},
  },
  resolve: {},
  optimizeDeps: {},
});
