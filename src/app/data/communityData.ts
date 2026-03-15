/**
 * Community Data Types
 * 
 * NOTE: This file previously contained mock data.
 * Mock data has been replaced with real Supabase queries.
 * This file now only exports type definitions for reference.
 * 
 * See /src/types/index.ts for canonical type definitions.
 */

import type { Activity } from "../../types";

export interface ActivityReview {
  id: string;
  activityId: string;
  activityName: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface SharedItinerary {
  id: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  activities: Activity[];
  likes: number;
  comments: number;
  sharedDate: string;
  tags: string[];
}

// Mock data has been removed - data now comes from Supabase
// See /src/services/api.ts for data fetching functions:
// - fetchActivityReviews()
// - fetchSharedItineraries()