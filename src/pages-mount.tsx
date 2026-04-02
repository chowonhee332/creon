import ReactDOM from 'react-dom/client';
import StoragePage from './pages/StoragePage';
import AdminPage from './pages/AdminPage';

let storageMounted = false;
let adminMounted = false;

export function mountStoragePage() {
  if (storageMounted) return;
  const el = document.getElementById('storage-page-root');
  if (!el) return;
  ReactDOM.createRoot(el).render(<StoragePage />);
  storageMounted = true;
}

export function mountAdminPage() {
  if (adminMounted) return;
  const el = document.getElementById('admin-page-root');
  if (!el) return;
  ReactDOM.createRoot(el).render(<AdminPage />);
  adminMounted = true;
}
