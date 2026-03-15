import { RouterProvider } from 'react-router';
import { router } from './routes';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </AuthProvider>
  );
}