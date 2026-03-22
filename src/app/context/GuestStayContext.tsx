import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { GuestStayProfile } from '../../types';

const STORAGE_KEY = 'simalem_guest_stay_profile';

function createDefaultGuestStayProfile(): GuestStayProfile {
  return {
    guestId: crypto.randomUUID(),
    guestName: '',
    checkInDate: null,
    checkOutDate: null,
    roomNumber: '203',
    updatedAt: null,
  };
}

interface GuestStayContextType {
  profile: GuestStayProfile;
  saveProfile: (profile: Omit<GuestStayProfile, 'updatedAt' | 'guestId'>) => void;
  restoreProfile: (profile: GuestStayProfile) => void;
  clearProfile: () => void;
  hasStayDetails: boolean;
}

const GuestStayContext = createContext<GuestStayContextType | undefined>(undefined);

function getStoredProfile(): GuestStayProfile {
  const savedProfile = localStorage.getItem(STORAGE_KEY);

  if (!savedProfile) {
    return createDefaultGuestStayProfile();
  }

  try {
    const parsedProfile = JSON.parse(savedProfile) as GuestStayProfile;

    return {
      guestId: parsedProfile.guestId ?? crypto.randomUUID(),
      guestName: parsedProfile.guestName ?? '',
      checkInDate: parsedProfile.checkInDate ?? null,
      checkOutDate: parsedProfile.checkOutDate ?? null,
      roomNumber: parsedProfile.roomNumber ?? '203',
      updatedAt: parsedProfile.updatedAt ?? null,
    };
  } catch {
    return createDefaultGuestStayProfile();
  }
}

export function GuestStayProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GuestStayProfile>(getStoredProfile);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const saveProfile = (nextProfile: Omit<GuestStayProfile, 'updatedAt' | 'guestId'>) => {
    setProfile({
      guestId: profile.guestId,
      ...nextProfile,
      updatedAt: new Date().toISOString(),
    });
  };

  const restoreProfile = (nextProfile: GuestStayProfile) => {
    setProfile({
      ...nextProfile,
      updatedAt: new Date().toISOString(),
    });
  };

  const clearProfile = () => {
    setProfile(createDefaultGuestStayProfile());
  };

  const hasStayDetails =
    profile.guestName.trim().length > 0 &&
    Boolean(profile.checkInDate) &&
    Boolean(profile.checkOutDate);

  return (
    <GuestStayContext.Provider
      value={{
        profile,
        saveProfile,
        restoreProfile,
        clearProfile,
        hasStayDetails,
      }}
    >
      {children}
    </GuestStayContext.Provider>
  );
}

export function useGuestStay() {
  const context = useContext(GuestStayContext);

  if (!context) {
    throw new Error('useGuestStay must be used within GuestStayProvider');
  }

  return context;
}
