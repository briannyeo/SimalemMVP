/**
 * API service layer for fetching data from Supabase edge functions
 * 
 * This module centralizes all data fetching logic and provides
 * a clean interface for components to use.
 */

import { getServerUrl, getAuthHeaders } from './supabase';
import type {
  Activity,
  AiItinerary,
  ActivityReview,
  CreateActivityReviewInput,
  CreateSharedItineraryInput,
  GuestBooking,
  SharedItinerary,
  GuestInterestProfile,
  ActivitiesResponse,
  GuestBookingsResponse,
  ReviewsResponse,
  ItinerariesResponse,
} from '../types';

const SERVER_ENDPOINT = 'make-server-01df2f8f';
const SERVER_FUNCTION_NAME = 'server';

function buildServerUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const hasFunctionName = /\/functions\/v1\/[^/]+$/i.test(
    normalizedBaseUrl,
  );
  const functionBaseUrl = hasFunctionName
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/${SERVER_FUNCTION_NAME}`;

  return `${functionBaseUrl}/${SERVER_ENDPOINT}/${path}`;
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchFromServer<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const [url, headers] = await Promise.all([
    getServerUrl(),
    getAuthHeaders(),
  ]);
  
  const fullUrl = buildServerUrl(url, path);
  const mergedHeaders = new Headers(headers);

  if (init?.headers) {
    const requestHeaders = new Headers(init.headers);
    requestHeaders.forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
  }

  if (init?.body && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(fullUrl, {
    ...init,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || `Failed to fetch ${path}: ${response.statusText}`;

    try {
      const errorPayload = JSON.parse(errorText) as {
        error?: string;
        details?: string;
      };
      errorMessage = errorPayload.details
        ? `${errorPayload.error ?? `Failed to fetch ${path}`}: ${errorPayload.details}`
        : errorPayload.error ?? `Failed to fetch ${path}: ${response.statusText}`;
    } catch {}

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Fetch all active activities from the database
 */
export async function fetchActivities(): Promise<Activity[]> {
  const response = await fetchFromServer<ActivitiesResponse>('activities');
  return response.activities || [];
}

/**
 * Fetch all activity reviews with activity details
 */
export async function fetchActivityReviews(): Promise<ActivityReview[]> {
  const response = await fetchFromServer<ReviewsResponse>('activity-reviews');
  return response.reviews || [];
}

/**
 * Fetch all shared itineraries with their activities
 */
export async function fetchSharedItineraries(): Promise<SharedItinerary[]> {
  const response = await fetchFromServer<ItinerariesResponse>('shared-itineraries');
  return response.itineraries || [];
}

/**
 * Fetch live guest bookings for the admin portal
 */
export async function fetchGuestBookings(): Promise<GuestBooking[]> {
  const response = await fetchFromServer<GuestBookingsResponse>('guest-bookings');
  return response.guestBookings || [];
}

/**
 * Persist a guest booking snapshot for live supervisor reporting
 */
export async function upsertGuestBooking(
  booking: GuestBooking,
): Promise<GuestBooking> {
  const response = await fetchFromServer<{ guestBooking: GuestBooking }>(
    'guest-bookings',
    {
      method: 'POST',
      body: JSON.stringify({ booking }),
    },
  );

  return response.guestBooking;
}

/**
 * Create a new activity review
 */
export async function createActivityReview(
  review: CreateActivityReviewInput,
): Promise<ActivityReview> {
  const response = await fetchFromServer<{ review: ActivityReview }>(
    'activity-reviews',
    {
      method: 'POST',
      body: JSON.stringify({ review }),
    },
  );

  return response.review;
}

/**
 * Share a new itinerary to the community hub
 */
export async function createSharedItinerary(
  itinerary: CreateSharedItineraryInput,
): Promise<SharedItinerary> {
  const response = await fetchFromServer<{ itinerary: SharedItinerary }>(
    'shared-itineraries',
    {
      method: 'POST',
      body: JSON.stringify({ itinerary }),
    },
  );

  return response.itinerary;
}

/**
 * Health check for the server
 */
export async function checkServerHealth(): Promise<{ status: string }> {
  return fetchFromServer<{ status: string }>('health');
}

/**
 * Generate an AI itinerary from the guest's interests
 */
export async function generateGuestItinerary(
  preferences: GuestInterestProfile,
): Promise<AiItinerary> {
  const response = await fetchFromServer<{ itinerary: AiItinerary }>(
    'ai-itinerary',
    {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    },
  );

  return response.itinerary;
}
