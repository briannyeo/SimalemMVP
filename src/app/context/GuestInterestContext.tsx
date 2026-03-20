import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Activity, GuestInterestKey, GuestInterestProfile } from '../../types';

const STORAGE_KEY = 'simalem_guest_interest_profile';

const defaultGuestInterestProfile: GuestInterestProfile = {
  selectedInterests: [],
  notes: '',
  updatedAt: null,
};

export const guestInterestOptions: Array<{
  id: GuestInterestKey;
  label: string;
  description: string;
}> = [
  {
    id: 'cultural',
    label: 'Cultural experiences',
    description: 'Local stories, food, and heritage-led activities.',
  },
  {
    id: 'environmental',
    label: 'Nature and conservation',
    description: 'Eco-focused experiences and outdoor discovery.',
  },
  {
    id: 'adventure',
    label: 'Adventure outings',
    description: 'Active experiences with a more energetic pace.',
  },
  {
    id: 'community',
    label: 'Community impact',
    description: 'Experiences that support local partners and people.',
  },
  {
    id: 'lowImpact',
    label: 'Low-impact options',
    description: 'Choices with lighter environmental intensity.',
  },
];

interface GuestInterestContextType {
  profile: GuestInterestProfile;
  saveProfile: (profile: Omit<GuestInterestProfile, 'updatedAt'>) => void;
  clearProfile: () => void;
  hasInterests: boolean;
}

const GuestInterestContext = createContext<GuestInterestContextType | undefined>(undefined);

function getStoredProfile(): GuestInterestProfile {
  const savedProfile = localStorage.getItem(STORAGE_KEY);

  if (!savedProfile) {
    return defaultGuestInterestProfile;
  }

  try {
    const parsedProfile = JSON.parse(savedProfile) as GuestInterestProfile;
    return {
      selectedInterests: parsedProfile.selectedInterests ?? [],
      notes: parsedProfile.notes ?? '',
      updatedAt: parsedProfile.updatedAt ?? null,
    };
  } catch {
    return defaultGuestInterestProfile;
  }
}

export function doesActivityMatchInterest(activity: Activity, interest: GuestInterestKey) {
  switch (interest) {
    case 'cultural':
      return activity.category === 'Cultural';
    case 'environmental':
      return activity.category === 'Environmental';
    case 'adventure':
      return activity.category === 'Adventure';
    case 'community':
      return activity.communityImpact !== 'No Direct Community Link';
    case 'lowImpact':
      return activity.environmentalImpact === 'Low';
    default:
      return false;
  }
}

export function GuestInterestProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GuestInterestProfile>(getStoredProfile);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const saveProfile = (nextProfile: Omit<GuestInterestProfile, 'updatedAt'>) => {
    setProfile({
      ...nextProfile,
      updatedAt: new Date().toISOString(),
    });
  };

  const clearProfile = () => {
    setProfile(defaultGuestInterestProfile);
  };

  const hasInterests =
    profile.selectedInterests.length > 0 || profile.notes.trim().length > 0;

  return (
    <GuestInterestContext.Provider
      value={{
        profile,
        saveProfile,
        clearProfile,
        hasInterests,
      }}
    >
      {children}
    </GuestInterestContext.Provider>
  );
}

export function useGuestInterest() {
  const context = useContext(GuestInterestContext);

  if (!context) {
    throw new Error('useGuestInterest must be used within GuestInterestProvider');
  }

  return context;
}
