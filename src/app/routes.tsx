import { createBrowserRouter } from 'react-router';
import { Activities } from './pages/Activities';
import { Checkout } from './pages/Checkout';
import { Summary } from './pages/Summary';
import { Community } from './pages/Community';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    index: true,
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: 'activities',
        element: (
          <ProtectedRoute allowedRole="guest">
            <Activities />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute allowedRole="guest">
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'summary',
        element: (
          <ProtectedRoute allowedRole="guest">
            <Summary />
          </ProtectedRoute>
        ),
      },
      {
        path: 'community',
        element: (
          <ProtectedRoute allowedRole="guest">
            <Community />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRole="supervisor">
            <Admin />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);