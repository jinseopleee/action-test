import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  build: {
    ssr: 'src/index.ts',
    target: 'node20',
    rollupOptions: {
      external: [...builtinModules],
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: 'index.js',
      },
    },
  },
  ssr: {
    noExternal: true,
  },
});
