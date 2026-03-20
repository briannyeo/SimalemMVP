/**
 * Centralized type definitions for the Simalem Resort booking application
 */

// ============================================================================
// Activity & Booking Types
// ============================================================================

export type CommunityImpact = 'Direct Local Partner' | 'Internal Community Support' | 'No Direct Community Link';
export type EnvironmentalImpact = 'Low' | 'Medium' | 'High';
export type ActivityCategory = 'Cultural' | 'Environmental' | 'Adventure';

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  communityImpact: CommunityImpact;
  environmentalImpact: EnvironmentalImpact;
  image: string;
  category: ActivityCategory;
  bookingDate?: Date;
  bookingTime?: string;
}

// ============================================================================
// Community Types
// ============================================================================

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

// ============================================================================
// Admin/Guest Types
// ============================================================================

export interface GuestBooking {
  guestId: string;
  guestName: string;
  email: string;
  checkInDate: string;
  checkoutDate: string;
  roomNumber: string;
  activities: Activity[];
}

// ============================================================================
// Auth Types
// ============================================================================

export type UserRole = 'guest' | 'supervisor';

export type GuestInterestKey =
  | 'cultural'
  | 'environmental'
  | 'adventure'
  | 'community'
  | 'lowImpact';

export interface GuestInterestProfile {
  selectedInterests: GuestInterestKey[];
  notes: string;
  updatedAt: string | null;
}

export interface AiItineraryRecommendation {
  activityId: string;
  activityName: string;
  reason: string;
  matchTags: string[];
}

export interface AiItinerarySource {
  fileName: string;
  score?: number;
  snippet?: string;
}

export interface AiItinerary {
  title: string;
  summary: string;
  rationale: string;
  recommendedActivities: AiItineraryRecommendation[];
  provider: 'openai-rag' | 'openai-prompt' | 'local-fallback';
  model: string;
  generatedAt: string;
  sources: AiItinerarySource[];
}

// ============================================================================
// Database Types (Supabase table schemas)
// ============================================================================

export interface ActivityRow {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  community_impact: CommunityImpact;
  environmental_impact: EnvironmentalImpact;
  image_url: string;
  category: ActivityCategory;
  is_active: boolean;
  created_at: string;
}

export interface ActivityReviewRow {
  id: string;
  activity_id: string;
  author_name: string;
  author_avatar_url: string;
  rating: number;
  comment: string;
  review_date: string;
  helpful_count: number;
}

export interface SharedItineraryRow {
  id: string;
  author_name: string;
  author_avatar_url: string;
  title: string;
  description: string;
  likes_count: number;
  comments_count: number;
  shared_date: string;
  tags: string[];
  created_at: string;
}

export interface SharedItineraryItemRow {
  id: string;
  shared_itinerary_id: string;
  activity_id: string;
  booking_date: string | null;
  booking_time: string | null;
  sort_order: number;
  created_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
}

export interface ReviewsResponse {
  reviews: ActivityReview[];
}

export interface ItinerariesResponse {
  itineraries: SharedItinerary[];
}
