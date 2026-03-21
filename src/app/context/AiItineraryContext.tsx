import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AiItinerary } from '../../types';

const STORAGE_KEY = 'simalem_ai_itinerary';

interface AiItineraryContextType {
  itinerary: AiItinerary | null;
  setItinerary: (itinerary: AiItinerary) => void;
  clearItinerary: () => void;
  clearAllItineraries: () => void;
}

const AiItineraryContext = createContext<AiItineraryContextType | undefined>(undefined);

function getStoredItinerary(): AiItinerary | null {
  const savedItinerary = localStorage.getItem(STORAGE_KEY);

  if (!savedItinerary) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedItinerary) as
      | { current?: AiItinerary | null; history?: AiItinerary[] }
      | AiItinerary;

    if ('history' in parsed || 'current' in parsed) {
      if (parsed.current) {
        return parsed.current;
      }

      if (Array.isArray(parsed.history) && parsed.history.length > 0) {
        return parsed.history[0];
      }

      return null;
    }

    return parsed as AiItinerary;
  } catch {
    return null;
  }
}

export function AiItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setStoredItinerary] = useState<AiItinerary | null>(getStoredItinerary);

  useEffect(() => {
    if (itinerary) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [itinerary]);

  const setItinerary = (nextItinerary: AiItinerary) => {
    setStoredItinerary(nextItinerary);
  };

  const clearItinerary = () => {
    setStoredItinerary(null);
  };

  const clearAllItineraries = () => {
    setStoredItinerary(null);
  };

  return (
    <AiItineraryContext.Provider
      value={{
        itinerary,
        setItinerary,
        clearItinerary,
        clearAllItineraries,
      }}
    >
      {children}
    </AiItineraryContext.Provider>
  );
}

export function useAiItinerary() {
  const context = useContext(AiItineraryContext);

  if (!context) {
    throw new Error('useAiItinerary must be used within AiItineraryProvider');
  }

  return context;
}
