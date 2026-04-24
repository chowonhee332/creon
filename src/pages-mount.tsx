import React from 'react';
import ReactDOM from 'react-dom/client';
import StoragePage from './pages/StoragePage';
import AdminPage from './pages/AdminPage';

let storageRoot: ReactDOM.Root | null = null;
let adminRoot: ReactDOM.Root | null = null;

export function mountStoragePage() {
  const container = document.getElementById('storage-page-root');
  if (!container) return;
  if (!storageRoot) {
    storageRoot = ReactDOM.createRoot(container);
  }
  storageRoot.render(<StoragePage />);
}

export function mountAdminPage() {
  const container = document.getElementById('admin-page-root');
  if (!container) return;
  if (!adminRoot) {
    adminRoot = ReactDOM.createRoot(container);
  }
  adminRoot.render(<AdminPage />);
}
