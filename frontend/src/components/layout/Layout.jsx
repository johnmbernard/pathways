import React from 'react';
import NavBar from '../NavBar';
import styles from './Layout.module.css';

// Main layout with sidebar
export function AppLayout({ children, onOpenHierarchy }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavBar onOpenHierarchy={onOpenHierarchy} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

// Page header component
export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderContent}>
        <div className={styles.pageHeaderInfo}>
          <h1 className={styles.pageHeaderTitle}>{title}</h1>
          {subtitle && <p className={styles.pageHeaderSubtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.pageHeaderActions}>{actions}</div>}
      </div>
    </header>
  );
}

// Content container
export function PageContent({ children, maxWidth = '7xl' }) {
  const widths = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return <div className={`${widths[maxWidth]} mx-auto px-6 py-8`}>{children}</div>;
}

export default { AppLayout, PageHeader, PageContent };
