import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AiItinerary } from '../../types';

const STORAGE_KEY = 'simalem_ai_itinerary';

interface StoredAiItineraries {
  current: AiItinerary | null;
  history: AiItinerary[];
}

interface AiItineraryContextType {
  itinerary: AiItinerary | null;
  itineraryHistory: AiItinerary[];
  setItinerary: (itinerary: AiItinerary) => void;
  selectItinerary: (itinerary: AiItinerary) => void;
  clearItinerary: () => void;
  clearAllItineraries: () => void;
}

const AiItineraryContext = createContext<AiItineraryContextType | undefined>(undefined);

function getStoredItineraries(): StoredAiItineraries {
  const savedItinerary = localStorage.getItem(STORAGE_KEY);

  if (!savedItinerary) {
    return {
      current: null,
      history: [],
    };
  }

  try {
    const parsed = JSON.parse(savedItinerary) as Partial<StoredAiItineraries> | AiItinerary;

    if ('history' in parsed || 'current' in parsed) {
      return {
        current: parsed.current ?? null,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }

    return {
      current: parsed as AiItinerary,
      history: parsed ? [parsed as AiItinerary] : [],
    };
  } catch {
    return {
      current: null,
      history: [],
    };
  }
}

export function AiItineraryProvider({ children }: { children: ReactNode }) {
  const [storedItineraries, setStoredItineraries] = useState<StoredAiItineraries>(
    getStoredItineraries,
  );

  useEffect(() => {
    if (storedItineraries.current || storedItineraries.history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedItineraries));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [storedItineraries]);

  const setItinerary = (nextItinerary: AiItinerary) => {
    setStoredItineraries((current) => {
      const nextHistory = [
        nextItinerary,
        ...current.history.filter(
          (itinerary) => itinerary.generatedAt !== nextItinerary.generatedAt,
        ),
      ].slice(0, 12);

      return {
        current: nextItinerary,
        history: nextHistory,
      };
    });
  };

  const selectItinerary = (nextItinerary: AiItinerary) => {
    setStoredItineraries((current) => ({
      current: nextItinerary,
      history: current.history,
    }));
  };

  const clearItinerary = () => {
    setStoredItineraries((current) => ({
      current: null,
      history: current.history,
    }));
  };

  const clearAllItineraries = () => {
    setStoredItineraries({
      current: null,
      history: [],
    });
  };

  return (
    <AiItineraryContext.Provider
      value={{
        itinerary: storedItineraries.current,
        itineraryHistory: storedItineraries.history,
        setItinerary,
        selectItinerary,
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
