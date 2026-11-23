import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 与 npm 安装后的真实使用方式保持一致的导入路径。
import 'archive-ui-react/style.css';
import App from './App';
import './playground.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Playground 根节点不存在');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
