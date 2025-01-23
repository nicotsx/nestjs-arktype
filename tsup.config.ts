import { defineConfig } from 'tsup';

// biome-ignore lint/style/noDefaultExport: needed for tsup
export default defineConfig({
  entryPoints: ['lib/index.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
});
