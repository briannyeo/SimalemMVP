import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { BookingModal } from "../components/BookingModal";
import { ActivityCard } from "../components/ActivityCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAiItinerary } from "../context/AiItineraryContext";
import { useBooking } from "../context/BookingContext";
import {
  doesActivityMatchInterest,
  guestInterestOptions,
  useGuestInterest,
} from "../context/GuestInterestContext";
import { fetchActivities } from "../../services/api";
import type { Activity } from "../../types";

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addActivity } = useBooking();
  const { itinerary, itineraryHistory, selectItinerary } = useAiItinerary();
  const { profile, hasInterests } = useGuestInterest();
  const location = useLocation();
  const navigate = useNavigate();
  const hasShownAiError = useRef(false);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActivities();
        setActivities(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load activities";
        setError(errorMessage);
        console.error("Error fetching activities:", err);
        toast.error("Failed to load activities", {
          description: "Please try refreshing the page",
        });
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  useEffect(() => {
    if (
      hasShownAiError.current ||
      !location.state ||
      typeof location.state !== "object" ||
      !("aiGenerationError" in location.state) ||
      !location.state.aiGenerationError
    ) {
      return;
    }

    hasShownAiError.current = true;
    toast.error("AI itinerary unavailable", {
      description: String(location.state.aiGenerationError),
    });
  }, [location.state]);

  const handleBookClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = (
    activity: Activity,
    date: Date,
    time: string,
  ) => {
    const activityWithBooking = {
      ...activity,
      bookingDate: date,
      bookingTime: time,
    };

    addActivity(activityWithBooking);
    toast.success(`${activity.name} added to itinerary!`, {
      description: `${date.toLocaleDateString()} at ${time} • Community: ${activity.communityImpact} • Environment: ${activity.environmentalImpact}`,
    });
  };

  const filteredActivities =
    selectedCategory === "all" || selectedCategory === "generated"
      ? [...activities]
      : activities.filter(
          (activity) => activity.category.toLowerCase() === selectedCategory,
        );

  const itineraryOrder = useMemo(
    () =>
      new Map(
        (itinerary?.recommendedActivities ?? []).map((recommendation, index) => [
          recommendation.activityId,
          index,
        ]),
      ),
    [itinerary],
  );

  const personalizedActivities = [...filteredActivities].sort((left, right) => {
    const leftItineraryRank = itineraryOrder.get(left.id);
    const rightItineraryRank = itineraryOrder.get(right.id);

    if (leftItineraryRank !== undefined || rightItineraryRank !== undefined) {
      if (leftItineraryRank === undefined) {
        return 1;
      }

      if (rightItineraryRank === undefined) {
        return -1;
      }

      return leftItineraryRank - rightItineraryRank;
    }

    const leftMatches = profile.selectedInterests.filter((interest) =>
      doesActivityMatchInterest(left, interest),
    ).length;
    const rightMatches = profile.selectedInterests.filter((interest) =>
      doesActivityMatchInterest(right, interest),
    ).length;

    if (rightMatches !== leftMatches) {
      return rightMatches - leftMatches;
    }

    return left.name.localeCompare(right.name);
  });

  const activeInterestLabels = guestInterestOptions
    .filter((option) => profile.selectedInterests.includes(option.id))
    .map((option) => option.label);

  const generatedItineraryCount = itineraryHistory.length;

  const handleUseGeneratedItinerary = (
    selectedItinerary: (typeof itineraryHistory)[number],
  ) => {
    selectItinerary(selectedItinerary);
    setSelectedCategory("all");
    toast.success("AI itinerary prioritized", {
      description: `${selectedItinerary.title} is now guiding the activity order.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gray-900 text-white py-16 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1615009820619-d69e2f948e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWtlJTIwVG9iYSUyMEluZG9uZXNpYXxlbnwxfHx8fDE3NzE2ODM0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Lake Toba"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-4">Discover Our Activities</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Experience meaningful adventures that benefit both local communities
            and the environment. Each activity contributes to our sustainability
            goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {itinerary && (
          <div className="mb-6 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                      AI itinerary
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      {itinerary.provider === "openai-rag"
                        ? "RAG-backed"
                        : itinerary.provider === "openai-prompt"
                          ? "AI generated"
                          : "Fallback suggestions"}
                    </Badge>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {itinerary.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm text-gray-600">
                      {itinerary.summary}
                    </p>
                  </div>
                  <p className="max-w-3xl text-sm text-gray-700">
                    {itinerary.rationale}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/guest-interests?returnTo=/activities")}
                >
                  Regenerate itinerary
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {itinerary.recommendedActivities.map((recommendation) => (
                  <div
                    key={recommendation.activityId}
                    className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {recommendation.activityName}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {recommendation.reason}
                    </p>
                    {recommendation.matchTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendation.matchTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {itinerary.sources.length > 0 && (
                <p className="text-xs text-gray-500">
                  Knowledge base sources:{" "}
                  {itinerary.sources.map((source) => source.fileName).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {hasInterests && (
          <div className="mb-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Tailored for you
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Your interests are shaping these recommendations
                  </h2>
                </div>
                {activeInterestLabels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeInterestLabels.map((label) => (
                      <Badge key={label} variant="secondary" className="rounded-full px-3 py-1">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
                {profile.notes && (
                  <p className="max-w-3xl text-sm text-gray-600">
                    "{profile.notes}"
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/guest-interests?returnTo=/activities")}
              >
                Update interests
              </Button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All Activities</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="adventure">Adventure</TabsTrigger>
              <TabsTrigger value="generated">
                Generated For You
                {generatedItineraryCount > 0 ? ` (${generatedItineraryCount})` : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading activities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 font-semibold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : selectedCategory === "generated" ? (
          itineraryHistory.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {itineraryHistory.map((savedItinerary) => (
                <div
                  key={savedItinerary.generatedAt}
                  className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                            AI itinerary
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            {savedItinerary.provider === "openai-rag"
                              ? "RAG-backed"
                              : savedItinerary.provider === "openai-prompt"
                                ? "AI generated"
                                : "Fallback suggestions"}
                          </Badge>
                          {itinerary?.generatedAt === savedItinerary.generatedAt && (
                            <Badge variant="outline" className="rounded-full">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900">
                            {savedItinerary.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-600">
                            {savedItinerary.summary}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">
                          {savedItinerary.rationale}
                        </p>
                        <p className="text-xs text-gray-500">
                          Generated {new Date(savedItinerary.generatedAt).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleUseGeneratedItinerary(savedItinerary)}
                      >
                        Prioritize This Plan
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {savedItinerary.recommendedActivities.map((recommendation) => (
                        <div
                          key={`${savedItinerary.generatedAt}-${recommendation.activityId}`}
                          className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <h4 className="font-semibold text-gray-900">
                            {recommendation.activityName}
                          </h4>
                          <p className="mt-2 text-sm text-gray-600">
                            {recommendation.reason}
                          </p>
                          {recommendation.matchTags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {recommendation.matchTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="rounded-full">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {savedItinerary.sources.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Knowledge base sources:{" "}
                        {savedItinerary.sources.map((source) => source.fileName).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/60 p-10 text-center">
              <h3 className="text-2xl font-semibold text-gray-900">
                No AI itineraries yet
              </h3>
              <p className="mt-3 text-sm text-gray-600">
                Generate an itinerary from your guest preferences and it will be
                stored here.
              </p>
              <Button
                type="button"
                className="mt-5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate("/guest-interests?returnTo=/activities")}
              >
                Create AI itinerary
              </Button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onBook={handleBookClick}
              />
            ))}
          </div>
        )}
      </div>

      <BookingModal
        activity={selectedActivity}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
