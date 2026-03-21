import { RouterProvider } from 'react-router';
import { router } from './routes';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import { AiItineraryProvider } from './context/AiItineraryContext';
import { GuestInterestProvider } from './context/GuestInterestContext';
import { GuestStayProvider } from './context/GuestStayContext';

export default function App() {
  return (
    <AuthProvider>
      <GuestStayProvider>
        <GuestInterestProvider>
          <AiItineraryProvider>
            <BookingProvider>
              <RouterProvider router={router} />
            </BookingProvider>
          </AiItineraryProvider>
        </GuestInterestProvider>
      </GuestStayProvider>
    </AuthProvider>
  );
}
