import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // 组件库构建不使用 public 目录（public/ 仅服务于 Playground 预览）。
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'ArchiveUIReact',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      // React、React DOM 及其运行时子路径（如 react/jsx-runtime）一律 external，
      // 不得进入组件库打包产物。
      external: [/^react($|\/)/, /^react-dom($|\/)/],
    },
  },
});
