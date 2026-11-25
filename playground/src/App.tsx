import { useState } from 'react';
import { cn } from 'archive-ui-react';
import { OverviewPage } from './pages/OverviewPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { RenderLabPage } from './pages/RenderLabPage';
import { ThemeEditorPage } from './pages/ThemeEditorPage';
import type { PageId } from './pages/types';

const PAGES: Array<{ id: PageId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Components' },
  { id: 'materials', label: 'Materials' },
  { id: 'render-lab', label: 'Render Lab' },
  { id: 'theme-editor', label: 'Theme Editor' },
];

export default function App() {
  const [page, setPage] = useState<PageId>('overview');

  return (
    <div className="pg-app">
      <nav className="pg-nav" aria-label="Playground 导航">
        <span className="pg-nav__brand">archive-ui-react</span>
        <ul className="pg-nav__list">
          {PAGES.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className={cn('pg-nav__item', page === id && 'pg-nav__item--active')}
                onClick={() => setPage(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="pg-main">
        {page === 'overview' && <OverviewPage />}
        {page === 'components' && <ComponentsPage />}
        {page === 'materials' && <MaterialsPage />}
        {page === 'render-lab' && <RenderLabPage />}
        {page === 'theme-editor' && <ThemeEditorPage />}
      </main>
    </div>
  );
}
