import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-01df2f8f/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all activities from database
app.get("/make-server-01df2f8f/activities", async (c) => {
  try {
    const { data: activitiesData, error } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activities from database:', error);
      return c.json({ error: 'Failed to fetch activities', details: error.message }, 500);
    }

    // Transform database format to frontend Activity format
    const activities = activitiesData.map((dbActivity) => {
      // Convert duration_minutes to hours format
      const hours = dbActivity.duration_minutes / 60;
      let durationText = '';
      
      if (hours === Math.floor(hours)) {
        // Whole hours (e.g., 2 hours, 3 hours)
        durationText = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        // Fractional hours (e.g., 2.5 hours, 3.5 hours)
        durationText = `${hours} hours`;
      }

      return {
        id: dbActivity.id,
        name: dbActivity.name,
        description: dbActivity.description,
        duration: durationText,
        price: parseFloat(dbActivity.price),
        communityImpact: dbActivity.community_impact,
        environmentalImpact: dbActivity.environmental_impact,
        image: dbActivity.image_url,
        category: dbActivity.category,
      };
    });

    return c.json({ activities });
  } catch (error) {
    console.error('Unexpected error while fetching activities:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Get all activity reviews with activity details
app.get("/make-server-01df2f8f/activity-reviews", async (c) => {
  try {
    const { data: reviewsData, error } = await supabase
      .from('activity_reviews')
      .select(`
        id,
        activity_id,
        author_name,
        author_avatar_url,
        rating,
        comment,
        review_date,
        helpful_count,
        activities (
          name
        )
      `)
      .order('review_date', { ascending: false });

    if (error) {
      console.error('Error fetching activity reviews from database:', error);
      return c.json({ error: 'Failed to fetch activity reviews', details: error.message }, 500);
    }

    // Transform database format to frontend ActivityReview format
    const reviews = reviewsData.map((dbReview) => ({
      id: dbReview.id,
      activityId: dbReview.activity_id,
      activityName: dbReview.activities?.name || 'Unknown Activity',
      userName: dbReview.author_name,
      userAvatar: dbReview.author_avatar_url,
      rating: dbReview.rating,
      comment: dbReview.comment,
      date: dbReview.review_date,
      helpful: dbReview.helpful_count,
    }));

    return c.json({ reviews });
  } catch (error) {
    console.error('Unexpected error while fetching activity reviews:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Get all shared itineraries with items and activity details
app.get("/make-server-01df2f8f/shared-itineraries", async (c) => {
  try {
    // First, fetch all shared itineraries
    const { data: itinerariesData, error: itinerariesError } = await supabase
      .from('shared_itineraries')
      .select('*')
      .order('shared_date', { ascending: false });

    if (itinerariesError) {
      console.error('Error fetching shared itineraries from database:', itinerariesError);
      return c.json({ error: 'Failed to fetch shared itineraries', details: itinerariesError.message }, 500);
    }

    // For each itinerary, fetch its items with activity details
    const itineraries = await Promise.all(
      itinerariesData.map(async (dbItinerary) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('shared_itinerary_items')
          .select(`
            sort_order,
            activities (
              id,
              name,
              description,
              duration_minutes,
              price,
              community_impact,
              environmental_impact,
              image_url,
              category
            )
          `)
          .eq('shared_itinerary_id', dbItinerary.id)
          .order('sort_order', { ascending: true });

        if (itemsError) {
          console.error(`Error fetching items for itinerary ${dbItinerary.id}:`, itemsError);
          return null;
        }

        // Transform items to Activity format
        const activities = itemsData.map((item) => {
          const activity = item.activities;
          const hours = activity.duration_minutes / 60;
          let durationText = '';
          
          if (hours === Math.floor(hours)) {
            durationText = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
          } else {
            durationText = `${hours} hours`;
          }

          return {
            id: activity.id,
            name: activity.name,
            description: activity.description,
            duration: durationText,
            price: parseFloat(activity.price),
            communityImpact: activity.community_impact,
            environmentalImpact: activity.environmental_impact,
            image: activity.image_url,
            category: activity.category,
          };
        });

        return {
          id: dbItinerary.id,
          userName: dbItinerary.author_name,
          userAvatar: dbItinerary.author_avatar_url,
          title: dbItinerary.title,
          description: dbItinerary.description,
          activities,
          likes: dbItinerary.likes_count,
          comments: dbItinerary.comments_count,
          sharedDate: dbItinerary.shared_date,
          tags: dbItinerary.tags || [],
        };
      })
    );

    // Filter out any null results from errors
    const validItineraries = itineraries.filter(i => i !== null);

    return c.json({ itineraries: validItineraries });
  } catch (error) {
    console.error('Unexpected error while fetching shared itineraries:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

Deno.serve(app.fetch);