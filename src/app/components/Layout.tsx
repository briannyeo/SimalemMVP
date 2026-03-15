import { Outlet } from 'react-router';
import { Header } from './Header';
import { Toaster } from './ui/sonner';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
      <Toaster />
    </div>
  );
}
