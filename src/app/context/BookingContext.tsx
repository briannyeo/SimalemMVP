import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Activity } from '../../types';

interface BookingContextType {
  bookedActivities: Activity[];
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  clearBookings: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookedActivities, setBookedActivities] = useState<Activity[]>([]);

  const addActivity = (activity: Activity) => {
    setBookedActivities(prev => [...prev, activity]);
  };

  const removeActivity = (activityId: string) => {
    setBookedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const clearBookings = () => {
    setBookedActivities([]);
  };

  return (
    <BookingContext.Provider
      value={{
        bookedActivities,
        addActivity,
        removeActivity,
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