import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { upsertGuestBooking } from '../../services/api';
import type { Activity } from '../../types';
import { useGuestStay } from './GuestStayContext';

interface BookingContextType {
  bookedActivities: Activity[];
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  replaceBookings: (activities: Activity[]) => void;
  clearBookings: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookedActivities, setBookedActivities] = useState<Activity[]>([]);
  const { profile, hasStayDetails } = useGuestStay();

  const addActivity = (activity: Activity) => {
    setBookedActivities(prev => [...prev, activity]);
  };

  const removeActivity = (activityId: string) => {
    setBookedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const replaceBookings = (activities: Activity[]) => {
    setBookedActivities(activities);
  };

  const clearBookings = () => {
    setBookedActivities([]);
  };

  useEffect(() => {
    if (!hasStayDetails) {
      return;
    }

    const syncGuestBookingSnapshot = async () => {
      try {
        await upsertGuestBooking({
          guestId: profile.guestId,
          guestName: profile.guestName.trim(),
          email: 'Not provided',
          checkInDate: profile.checkInDate ?? '',
          checkoutDate: profile.checkOutDate ?? '',
          roomNumber: profile.roomNumber,
          activities: bookedActivities,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to sync guest booking snapshot:', error);
      }
    };

    void syncGuestBookingSnapshot();
  }, [
    bookedActivities,
    hasStayDetails,
    profile.checkInDate,
    profile.checkOutDate,
    profile.guestId,
    profile.guestName,
    profile.roomNumber,
  ]);

  return (
    <BookingContext.Provider
      value={{
        bookedActivities,
        addActivity,
        removeActivity,
        replaceBookings,
        clearBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
