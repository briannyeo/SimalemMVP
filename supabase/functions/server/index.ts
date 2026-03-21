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

function getSuggestedTime(index: number) {
  const suggestedTimes = [
    '8:30 AM to 10:00 AM',
    '11:00 AM to 1:00 PM',
    '3:00 PM to 5:00 PM',
  ];

  return suggestedTimes[index] ?? 'Flexible timing';
}

function formatDuration(durationMinutes: number) {
  const hours = durationMinutes / 60;

  if (hours === Math.floor(hours)) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} hours`;
}

function normalizeActivityId(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
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
        const activities = itemsData.map((item) =>
          mapDbActivityToFrontend(item.activities as ActivityRecord),
        );

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

app.notFound((c) => {
  console.error("No matching route for path:", c.req.path);
  return c.json({ error: "Route not found", path: c.req.path }, 404);
});

Deno.serve(app.fetch);
