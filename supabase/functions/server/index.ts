import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
const app = new Hono();
const SERVER_ENDPOINT = "/make-server-01df2f8f";
const SERVER_ROUTE_PREFIXES = [
  "",
  "/server",
  "/functions/v1/server",
];

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

function registerGet(path: string, handler: Parameters<typeof app.get>[1]) {
  SERVER_ROUTE_PREFIXES.forEach((prefix) => {
    app.get(`${prefix}${path}`, handler);
  });
}

function registerPost(path: string, handler: Parameters<typeof app.post>[1]) {
  SERVER_ROUTE_PREFIXES.forEach((prefix) => {
    app.post(`${prefix}${path}`, handler);
  });
}

registerGet("/", (c) => {
  return c.json({
    status: "ok",
    message: "Simalem edge function is running",
  });
});

registerGet(`${SERVER_ENDPOINT}/health`, (c) => {
  return c.json({ status: "ok" });
});

type ActivityRecord = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  community_impact: string;
  environmental_impact: string;
  image_url: string;
  category: string;
  is_active?: boolean;
  created_at?: string;
};

type GuestPreferences = {
  selectedInterests?: string[];
  notes?: string;
};

type CreateActivityReviewInput = {
  activityId?: string;
  userName?: string;
  userAvatar?: string;
  rating?: number;
  comment?: string;
};

type CreateSharedItineraryInput = {
  userName?: string;
  userAvatar?: string;
  title?: string;
  description?: string;
  activityIds?: string[];
  tags?: string[];
};

type GuestBookingInput = {
  guestId?: string;
  guestName?: string;
  email?: string;
  checkInDate?: string;
  checkoutDate?: string;
  roomNumber?: string;
  activities?: any[];
  updatedAt?: string;
};

function getSuggestedTime(index: number) {
  const suggestedTimes = [
    '8:30 AM to 10:00 AM',
    '11:00 AM to 1:00 PM',
    '3:00 PM to 5:00 PM',
  ];

  return suggestedTimes[index] ?? 'Flexible timing';
}

function formatDuration(durationMinutes: number) {
  const roundedMinutes = Math.round(durationMinutes);
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} mins`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} mins`;
}

function normalizeActivityId(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function buildAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=059669&color=ffffff`;
}

function mapDbActivityToFrontend(dbActivity: ActivityRecord) {
  return {
    id: normalizeActivityId(dbActivity.id),
    name: dbActivity.name,
    description: dbActivity.description,
    duration: formatDuration(dbActivity.duration_minutes),
    price: parseFloat(String(dbActivity.price)),
    communityImpact: dbActivity.community_impact,
    environmentalImpact: dbActivity.environmental_impact,
    image: dbActivity.image_url,
    category: dbActivity.category,
  };
}

function mapReviewToFrontend(review: any) {
  return {
    id: normalizeActivityId(review.id),
    activityId: normalizeActivityId(review.activity_id),
    activityName: review.activities?.name || 'Unknown Activity',
    userName: review.author_name,
    userAvatar: review.author_avatar_url,
    rating: review.rating,
    comment: review.comment,
    date: review.review_date,
    helpful: review.helpful_count,
  };
}

function getGuestBookingStorageKey(guestId: string) {
  return `guest-booking:${guestId}`;
}

function sanitizeGuestBooking(
  candidate: GuestBookingInput,
  activities: ReturnType<typeof mapDbActivityToFrontend>[],
) {
  const activityIndex = new Map(
    activities.map((activity) => [normalizeActivityId(activity.id), activity]),
  );
  const sanitizedActivities = Array.isArray(candidate.activities)
    ? candidate.activities
        .map((activity: any) => {
          const activityId = normalizeActivityId(activity?.id);
          const liveActivity = activityIndex.get(activityId);

          if (!liveActivity) {
            return null;
          }

          return {
            ...liveActivity,
            bookingDate:
              typeof activity?.bookingDate === 'string' && activity.bookingDate.trim()
                ? activity.bookingDate
                : undefined,
            bookingTime:
              typeof activity?.bookingTime === 'string' && activity.bookingTime.trim()
                ? activity.bookingTime.trim()
                : undefined,
          };
        })
        .filter(Boolean)
    : [];

  return {
    guestId: normalizeActivityId(candidate.guestId),
    guestName: candidate.guestName?.trim() || 'Simalem Guest',
    email: candidate.email?.trim() || 'Not provided',
    checkInDate: candidate.checkInDate?.trim() || '',
    checkoutDate: candidate.checkoutDate?.trim() || '',
    roomNumber: candidate.roomNumber?.trim() || '203',
    activities: sanitizedActivities,
    updatedAt: candidate.updatedAt?.trim() || new Date().toISOString(),
  };
}

async function fetchSharedItineraryById(sharedItineraryId: string) {
  const { data: dbItinerary, error: itineraryError } = await supabase
    .from('shared_itineraries')
    .select('*')
    .eq('id', sharedItineraryId)
    .single();

  if (itineraryError) {
    throw new Error(itineraryError.message);
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('shared_itinerary_items')
    .select(`
      activity_id,
      booking_date,
      booking_time,
      sort_order
    `)
    .eq('shared_itinerary_id', sharedItineraryId)
    .order('sort_order', { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const activityIds = (itemsData ?? [])
    .map((item: any) => normalizeActivityId(item.activity_id))
    .filter(Boolean);

  const { data: activitiesData, error: activitiesError } = activityIds.length > 0
    ? await supabase
        .from('activities')
        .select(`
          id,
          name,
          description,
          duration_minutes,
          price,
          community_impact,
          environmental_impact,
          image_url,
          category
        `)
        .in('id', activityIds)
    : { data: [], error: null };

  if (activitiesError) {
    throw new Error(activitiesError.message);
  }

  const activityIndex = new Map(
    (activitiesData ?? []).map((activity: any) => [
      normalizeActivityId(activity.id),
      activity as ActivityRecord,
    ]),
  );

  const activities = (itemsData ?? [])
    .map((item: any) => {
      const activityRecord = activityIndex.get(normalizeActivityId(item.activity_id));

      if (!activityRecord) {
        return null;
      }

      const activity = mapDbActivityToFrontend(activityRecord);

      return {
        ...activity,
        bookingDate: item.booking_date
          ? new Date(`${item.booking_date}T00:00:00`)
          : undefined,
        bookingTime:
          typeof item.booking_time === 'string' && item.booking_time.trim()
            ? item.booking_time.trim()
            : undefined,
      };
    })
    .filter(Boolean);

  return {
    id: normalizeActivityId(dbItinerary.id),
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
}

async function fetchActiveActivitiesFromDb() {
  const { data: activitiesData, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return activitiesData as ActivityRecord[];
}

function getInterestMatchTags(activity: ReturnType<typeof mapDbActivityToFrontend>, preferences: GuestPreferences) {
  const selectedInterests = preferences.selectedInterests ?? [];
  const tags: string[] = [];

  if (selectedInterests.includes('cultural') && activity.category === 'Cultural') {
    tags.push('Cultural');
  }

  if (selectedInterests.includes('environmental') && activity.category === 'Environmental') {
    tags.push('Environmental');
  }

  if (selectedInterests.includes('adventure') && activity.category === 'Adventure') {
    tags.push('Adventure');
  }

  if (
    selectedInterests.includes('community') &&
    activity.communityImpact !== 'No Direct Community Link'
  ) {
    tags.push('Community impact');
  }

  if (
    selectedInterests.includes('lowImpact') &&
    activity.environmentalImpact === 'Low'
  ) {
    tags.push('Low impact');
  }

  return tags;
}

function buildActivityKnowledgeBase(activities: ReturnType<typeof mapDbActivityToFrontend>[]) {
  return activities
    .map(
      (activity) => [
        `ID: ${activity.id}`,
        `Name: ${activity.name}`,
        `Category: ${activity.category}`,
        `Description: ${activity.description}`,
        `Duration: ${activity.duration}`,
        `Price: $${activity.price}`,
        `Community impact: ${activity.communityImpact}`,
        `Environmental impact: ${activity.environmentalImpact}`,
      ].join('\n'),
    )
    .join('\n\n---\n\n');
}

function buildFallbackItinerary(
  preferences: GuestPreferences,
  activities: ReturnType<typeof mapDbActivityToFrontend>[],
) {
  const rankedActivities = activities
    .map((activity) => {
      const matchTags = getInterestMatchTags(activity, preferences);
      return {
        activity,
        matchTags,
        score: matchTags.length,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.activity.name.localeCompare(right.activity.name);
    })
    .slice(0, 3);

  return {
    title: 'Recommended resort itinerary',
    summary: 'A preference-based itinerary generated from the current activity catalog.',
    rationale:
      preferences.notes?.trim()
        ? `Built around the guest notes: ${preferences.notes.trim()}`
        : 'Built from the guest’s selected interests and the live resort activity catalog.',
    recommendedActivities: rankedActivities.map(({ activity, matchTags }, index) => ({
      activityId: activity.id,
      activityName: activity.name,
      reason:
        matchTags.length > 0
          ? `Matches: ${matchTags.join(', ')}.`
          : 'A balanced option from the current activity catalog.',
      matchTags,
      suggestedTime: getSuggestedTime(index),
    })),
    provider: 'local-fallback',
    model: 'rules-based-fallback',
    generatedAt: new Date().toISOString(),
    sources: [],
  };
}

function extractOutputText(responseData: any) {
  if (typeof responseData?.output_text === 'string' && responseData.output_text.trim()) {
    return responseData.output_text.trim();
  }

  if (!Array.isArray(responseData?.output)) {
    return '';
  }

  return responseData.output
    .flatMap((item: any) => item?.content ?? [])
    .filter((content: any) => content?.type === 'output_text' && typeof content?.text === 'string')
    .map((content: any) => content.text)
    .join('\n')
    .trim();
}

function parseJsonBlock(text: string) {
  const trimmedText = text.trim();
  const fencedMatch = trimmedText.match(/```json\s*([\s\S]*?)```/i);

  if (fencedMatch) {
    return JSON.parse(fencedMatch[1]);
  }

  return JSON.parse(trimmedText);
}

function sanitizeItinerary(
  candidate: any,
  activities: ReturnType<typeof mapDbActivityToFrontend>[],
  provider: 'openai-rag' | 'openai-prompt',
  model: string,
  sources: Array<{ fileName: string; score?: number; snippet?: string }>,
) {
  const activityIndex = new Map(
    activities.map((activity) => [normalizeActivityId(activity.id), activity]),
  );
  const recommendations = Array.isArray(candidate?.recommendedActivities)
    ? candidate.recommendedActivities
        .map((recommendation: any, index: number) => {
          const normalizedRecommendationId = normalizeActivityId(
            recommendation?.activityId,
          );
          const activity = activityIndex.get(normalizedRecommendationId);

          if (!activity) {
            return null;
          }

          return {
            activityId: activity.id,
            activityName: activity.name,
            reason:
              typeof recommendation?.reason === 'string' && recommendation.reason.trim()
                ? recommendation.reason.trim()
                : `Recommended for guests interested in ${activity.category.toLowerCase()} experiences.`,
            matchTags: Array.isArray(recommendation?.matchTags)
              ? recommendation.matchTags.filter((tag: unknown) => typeof tag === 'string')
              : [],
            suggestedTime:
              typeof recommendation?.suggestedTime === 'string' &&
              recommendation.suggestedTime.trim()
                ? recommendation.suggestedTime.trim()
                : getSuggestedTime(index),
          };
        })
        .filter(Boolean)
    : [];

  return {
    title:
      typeof candidate?.title === 'string' && candidate.title.trim()
        ? candidate.title.trim()
        : 'AI-generated resort itinerary',
    summary:
      typeof candidate?.summary === 'string' && candidate.summary.trim()
        ? candidate.summary.trim()
        : 'An itinerary tailored to the guest’s interests using the resort activity catalog.',
    rationale:
      typeof candidate?.rationale === 'string' && candidate.rationale.trim()
        ? candidate.rationale.trim()
        : 'Generated from guest preferences and the resort knowledge base.',
    recommendedActivities: recommendations,
    provider,
    model,
    generatedAt: new Date().toISOString(),
    sources,
  };
}

registerGet(`${SERVER_ENDPOINT}/activities`, async (c) => {
  try {
    const activitiesData = await fetchActiveActivitiesFromDb();
    const activities = activitiesData.map(mapDbActivityToFrontend);

    return c.json({ activities });
  } catch (error) {
    console.error('Unexpected error while fetching activities:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

registerGet(`${SERVER_ENDPOINT}/guest-bookings`, async (c) => {
  try {
    const { data, error } = await supabase
      .from('kv_store_01df2f8f')
      .select('key, value')
      .like('key', 'guest-booking:%');

    if (error) {
      console.error('Error fetching guest bookings:', error);
      return c.json({ error: 'Failed to fetch guest bookings', details: error.message }, 500);
    }

    const guestBookings = (data ?? [])
      .map((entry: any) => entry.value)
      .filter(Boolean)
      .sort((left: any, right: any) => {
        const leftTime = new Date(left?.updatedAt ?? 0).getTime();
        const rightTime = new Date(right?.updatedAt ?? 0).getTime();
        return rightTime - leftTime;
      });

    return c.json({ guestBookings });
  } catch (error) {
    console.error('Unexpected error while fetching guest bookings:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

registerPost(`${SERVER_ENDPOINT}/guest-bookings`, async (c) => {
  try {
    const body = await c.req.json();
    const candidateBooking = (body?.booking ?? {}) as GuestBookingInput;
    const activitiesData = await fetchActiveActivitiesFromDb();
    const activities = activitiesData.map(mapDbActivityToFrontend);
    const guestBooking = sanitizeGuestBooking(candidateBooking, activities);

    if (!guestBooking.guestId) {
      return c.json({ error: 'Guest booking id is required' }, 400);
    }

    if (!guestBooking.checkInDate || !guestBooking.checkoutDate) {
      return c.json({ error: 'Check-in and checkout dates are required' }, 400);
    }

    const { error } = await supabase
      .from('kv_store_01df2f8f')
      .upsert({
        key: getGuestBookingStorageKey(guestBooking.guestId),
        value: guestBooking,
      });

    if (error) {
      console.error('Error storing guest booking:', error);
      return c.json({ error: 'Failed to save guest booking', details: error.message }, 500);
    }

    return c.json({ guestBooking });
  } catch (error) {
    console.error('Unexpected error while saving guest booking:', error);
    return c.json({ error: 'Failed to save guest booking', details: error.message }, 500);
  }
});

registerPost(`${SERVER_ENDPOINT}/ai-itinerary`, async (c) => {
  try {
    const body = await c.req.json();
    const preferences = (body?.preferences ?? {}) as GuestPreferences;
    const activitiesData = await fetchActiveActivitiesFromDb();
    const activities = activitiesData.map(mapDbActivityToFrontend);

    if (activities.length === 0) {
      return c.json({ error: 'No activities available for itinerary generation' }, 400);
    }

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    const openAiModel = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.4-mini';
    const vectorStoreId = Deno.env.get('OPENAI_VECTOR_STORE_ID');

    if (!openAiApiKey) {
      return c.json({
        itinerary: buildFallbackItinerary(preferences, activities),
      });
    }

    const activityCatalog = buildActivityKnowledgeBase(activities);
    const tools = vectorStoreId
      ? [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId],
            max_num_results: 4,
          },
        ]
      : [];

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openAiModel,
        reasoning: {
          effort: 'low',
        },
        instructions:
          'You are a resort itinerary planner. Build a concise itinerary recommendation grounded in the supplied resort activity catalog and any file_search results. Recommend exactly 3 activities. Only recommend activities whose IDs exist in the catalog. Return valid JSON with keys title, summary, rationale, and recommendedActivities. recommendedActivities must be an array of objects with activityId, reason, matchTags, and suggestedTime. suggestedTime should be a clear guest-facing time window such as 8:30 AM to 10:00 AM.',
        input: `Guest interests: ${(preferences.selectedInterests ?? []).join(', ') || 'none provided'}\nGuest notes: ${preferences.notes?.trim() || 'none provided'}\n\nCurrent resort activity catalog:\n${activityCatalog}`,
        tools,
        include: vectorStoreId ? ['file_search_call.results'] : [],
      }),
    });

    if (!openAiResponse.ok) {
      const errorPayload = await openAiResponse.text();
      console.error('OpenAI itinerary generation failed:', errorPayload);
      return c.json({
        itinerary: buildFallbackItinerary(preferences, activities),
      });
    }

    const responseData = await openAiResponse.json();
    const outputText = extractOutputText(responseData);
    const fileSearchSources = Array.isArray(responseData?.output)
      ? responseData.output
          .filter((item: any) => item?.type === 'file_search_call')
          .flatMap((item: any) => item?.results ?? [])
          .map((result: any) => ({
            fileName: result?.filename ?? 'knowledge-base',
            score: typeof result?.score === 'number' ? result.score : undefined,
            snippet:
              typeof result?.text === 'string'
                ? result.text.slice(0, 200)
                : undefined,
          }))
      : [];

    if (!outputText) {
      return c.json({
        itinerary: buildFallbackItinerary(preferences, activities),
      });
    }

    let parsedItinerary;

    try {
      parsedItinerary = parseJsonBlock(outputText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI itinerary JSON:', parseError);
      return c.json({
        itinerary: buildFallbackItinerary(preferences, activities),
      });
    }

    const sanitizedItinerary = sanitizeItinerary(
      parsedItinerary,
      activities,
      vectorStoreId ? 'openai-rag' : 'openai-prompt',
      openAiModel,
      fileSearchSources,
    );

    if (sanitizedItinerary.recommendedActivities.length === 0) {
      return c.json({
        itinerary: buildFallbackItinerary(preferences, activities),
      });
    }

    return c.json({ itinerary: sanitizedItinerary });
  } catch (error) {
    console.error('Unexpected error while generating itinerary:', error);
    return c.json({ error: 'Failed to generate itinerary', details: error.message }, 500);
  }
});

registerGet(`${SERVER_ENDPOINT}/activity-reviews`, async (c) => {
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
    const reviews = reviewsData.map(mapReviewToFrontend);

    return c.json({ reviews });
  } catch (error) {
    console.error('Unexpected error while fetching activity reviews:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

registerPost(`${SERVER_ENDPOINT}/activity-reviews`, async (c) => {
  try {
    const body = await c.req.json();
    const review = (body?.review ?? {}) as CreateActivityReviewInput;
    const reviewId = crypto.randomUUID();
    const activityId = normalizeActivityId(review.activityId);
    const userName = review.userName?.trim() || 'Simalem Guest';
    const comment = review.comment?.trim() || '';
    const rating = Number(review.rating);

    if (!activityId) {
      return c.json({ error: 'Activity is required' }, 400);
    }

    if (!comment) {
      return c.json({ error: 'Review comment is required' }, 400);
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    const avatarUrl = review.userAvatar?.trim() || buildAvatarUrl(userName);

    const { data: insertedReview, error: insertError } = await supabase
      .from('activity_reviews')
      .insert({
        id: reviewId,
        activity_id: activityId,
        author_name: userName,
        author_avatar_url: avatarUrl,
        rating,
        comment,
        review_date: new Date().toISOString(),
        helpful_count: 0,
      })
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
      .single();

    if (insertError) {
      console.error('Error creating activity review:', insertError);
      return c.json({ error: 'Failed to create activity review', details: insertError.message }, 500);
    }

    return c.json({ review: mapReviewToFrontend(insertedReview) });
  } catch (error) {
    console.error('Unexpected error while creating activity review:', error);
    return c.json({ error: 'Failed to create activity review', details: error.message }, 500);
  }
});

registerGet(`${SERVER_ENDPOINT}/shared-itineraries`, async (c) => {
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
        try {
          return await fetchSharedItineraryById(normalizeActivityId(dbItinerary.id));
        } catch (itemsError) {
          console.error(`Error fetching items for itinerary ${dbItinerary.id}:`, itemsError);
          return null;
        }
      }),
    );

    // Filter out any null results from errors
    const validItineraries = itineraries.filter(i => i !== null);

    return c.json({ itineraries: validItineraries });
  } catch (error) {
    console.error('Unexpected error while fetching shared itineraries:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

registerPost(`${SERVER_ENDPOINT}/shared-itineraries`, async (c) => {
  try {
    const body = await c.req.json();
    const itinerary = (body?.itinerary ?? {}) as CreateSharedItineraryInput;
    const sharedItineraryId = crypto.randomUUID();
    const userName = itinerary.userName?.trim() || 'Simalem Guest';
    const title = itinerary.title?.trim() || '';
    const description = itinerary.description?.trim() || '';
    const activityIds = Array.isArray(itinerary.activityIds)
      ? itinerary.activityIds.map(normalizeActivityId).filter(Boolean)
      : [];
    const tags = Array.isArray(itinerary.tags)
      ? itinerary.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    if (!description) {
      return c.json({ error: 'Description is required' }, 400);
    }

    if (activityIds.length === 0) {
      return c.json({ error: 'At least one activity is required to share an itinerary' }, 400);
    }

    const { data: matchingActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('id')
      .in('id', activityIds);

    if (activitiesError) {
      console.error('Error validating itinerary activities:', activitiesError);
      return c.json({ error: 'Failed to validate itinerary activities', details: activitiesError.message }, 500);
    }

    const validActivityIds = new Set(
      (matchingActivities ?? []).map((activity) => normalizeActivityId(activity.id)),
    );
    const orderedValidActivityIds = activityIds.filter((activityId) =>
      validActivityIds.has(activityId),
    );

    if (orderedValidActivityIds.length === 0) {
      return c.json({ error: 'Selected activities are no longer available' }, 400);
    }

    const avatarUrl = itinerary.userAvatar?.trim() || buildAvatarUrl(userName);

    const { data: insertedItinerary, error: itineraryError } = await supabase
      .from('shared_itineraries')
      .insert({
        id: sharedItineraryId,
        author_name: userName,
        author_avatar_url: avatarUrl,
        title,
        description,
        likes_count: 0,
        comments_count: 0,
        shared_date: new Date().toISOString(),
        tags,
      })
      .select('id')
      .single();

    if (itineraryError) {
      console.error('Error creating shared itinerary:', itineraryError);
      return c.json({ error: 'Failed to share itinerary', details: itineraryError.message }, 500);
    }

    const normalizedSharedItineraryId = normalizeActivityId(insertedItinerary.id);
    const itemsPayload = orderedValidActivityIds.map((activityId, index) => ({
      id: crypto.randomUUID(),
      shared_itinerary_id: normalizedSharedItineraryId,
      activity_id: activityId,
      booking_date: null,
      booking_time: null,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from('shared_itinerary_items')
      .insert(itemsPayload);

    if (itemsError) {
      await supabase.from('shared_itineraries').delete().eq('id', normalizedSharedItineraryId);
      console.error('Error creating shared itinerary items:', itemsError);
      return c.json({ error: 'Failed to share itinerary', details: itemsError.message }, 500);
    }

    const sharedItinerary = await fetchSharedItineraryById(normalizedSharedItineraryId);

    return c.json({ itinerary: sharedItinerary });
  } catch (error) {
    console.error('Unexpected error while creating shared itinerary:', error);
    return c.json({ error: 'Failed to share itinerary', details: error.message }, 500);
  }
});

app.notFound((c) => {
  console.error("No matching route for path:", c.req.path);
  return c.json({ error: "Route not found", path: c.req.path }, 404);
});

Deno.serve(app.fetch);
