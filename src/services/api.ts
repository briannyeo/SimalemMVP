/**
 * API service layer for fetching data from Supabase edge functions
 * 
 * This module centralizes all data fetching logic and provides
 * a clean interface for components to use.
 */

import { getServerUrl, getAuthHeaders } from './supabase';
import type {
  Activity,
  ActivityReview,
  SharedItinerary,
  ActivitiesResponse,
  ReviewsResponse,
  ItinerariesResponse,
} from '../types';

const SERVER_ENDPOINT = 'make-server-01df2f8f';

/**
 * Base fetch wrapper with error handling
 */
async function fetchFromServer<T>(path: string): Promise<T> {
  const [url, headers] = await Promise.all([
    getServerUrl(),
    getAuthHeaders(),
  ]);
  
  const fullUrl = `${url}/${SERVER_ENDPOINT}/${path}`;
  
  const response = await fetch(fullUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
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
 * Health check for the server
 */
export async function checkServerHealth(): Promise<{ status: string }> {
  return fetchFromServer<{ status: string }>('health');
}
