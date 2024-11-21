import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    outDir: 'dist',
    target: 'es2020',
    lib: {
      entry: './src/index.ts',
      name: 'outsystemsSynapse',
      fileName: (format) => `synapse.${format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'js'}`,
      formats: ['es', 'cjs', 'umd'],
    },
  },
});
