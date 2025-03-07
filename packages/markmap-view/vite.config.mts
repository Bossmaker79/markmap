import { defineConfig } from 'vite';

const configEs = defineConfig({
  build: {
    emptyOutDir: !process.env.KEEP_DIST,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['d3', 'markmap-common'],
    },
  },
});

const configJs = defineConfig({
  build: {
    emptyOutDir: !process.env.KEEP_DIST,
    outDir: 'dist/browser',
    lib: {
      entry: 'src/index.ts',
      formats: ['iife'],
      fileName: () => 'index.js',
      name: 'markmap',
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        extend: true,
        globals: {
          d3: 'd3',
        }
      }
    }
  },
});

export default process.env.TARGET === 'es' ? configEs : configJs;
