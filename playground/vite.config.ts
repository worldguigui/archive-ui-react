import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Playground 的根目录即本配置所在目录（playground/）。
// 通过 alias 将包名指向组件库源码，保证 Playground 使用的
// import 路径（'archive-ui-react'、'archive-ui-react/style.css'）
// 与 npm 安装后的真实使用方式完全一致。
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: fileURLToPath(new URL('../public/playground', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      'archive-ui-react/style.css': fileURLToPath(
        new URL('../src/styles/style.css', import.meta.url),
      ),
      'archive-ui-react': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
});
