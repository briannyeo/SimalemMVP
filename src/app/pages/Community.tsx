import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  ThumbsUp,
  Calendar,
  Users,
  Leaf,
  Bookmark,
} from "lucide-react";
import type {
  Activity,
  ActivityReview,
  CreateActivityReviewInput,
  CreateSharedItineraryInput,
  SharedItinerary,
} from "../../types";
import {
  createActivityReview,
  createSharedItinerary,
  fetchActivities,
  fetchActivityReviews,
  fetchSharedItineraries,
} from "../../services/api";
import { toast } from "sonner";
import { formatDurationDisplay } from "../../utils/formatters";
import { useBooking } from "../context/BookingContext";

const COMMUNITY_PROFILE_KEY = "simalem_community_profile";

type CommunityProfile = {
  userName: string;
  userAvatar: string;
};

function getStoredCommunityProfile(): CommunityProfile {
  const fallbackProfile = {
    userName: "Simalem Guest",
    userAvatar: "",
  };

  const savedProfile = localStorage.getItem(COMMUNITY_PROFILE_KEY);

  if (!savedProfile) {
    return fallbackProfile;
  }

  try {
    const parsedProfile = JSON.parse(savedProfile) as Partial<CommunityProfile>;
    return {
      userName: parsedProfile.userName?.trim() || fallbackProfile.userName,
      userAvatar: parsedProfile.userAvatar?.trim() || "",
    };
  } catch {
    return fallbackProfile;
  }
}

function buildDerivedTags(activities: Activity[]) {
  return Array.from(
    new Set(
      activities.flatMap((activity) => {
        const tags = [activity.category];

        if (activity.communityImpact !== "No Direct Community Link") {
          tags.push("Community impact");
        }

        if (activity.environmentalImpact === "Low") {
          tags.push("Low impact");
        }

        return tags;
      }),
    ),
  );
}

export function Community() {
  const navigate = useNavigate();
  const { bookedActivities } = useBooking();
  const [selectedTab, setSelectedTab] = useState("itineraries");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState("all");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityReviews, setActivityReviews] = useState<ActivityReview[]>([]);
  const [sharedItineraries, setSharedItineraries] = useState<SharedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubmittingItinerary, setIsSubmittingItinerary] = useState(false);
  const [profile, setProfile] = useState<CommunityProfile>(getStoredCommunityProfile);
  const [reviewActivityId, setReviewActivityId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [shareTags, setShareTags] = useState("");

  const shareableActivities = Array.from(
    new Map(bookedActivities.map((activity) => [activity.id, activity])).values(),
  );

  const filteredReviews =
    selectedActivityFilter === "all"
      ? activityReviews
      : activityReviews.filter((review) => review.activityId === selectedActivityFilter);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const [activitiesData, reviewsData, itinerariesData] = await Promise.all([
        fetchActivities(),
        fetchActivityReviews(),
        fetchSharedItineraries(),
      ]);

      setActivities(activitiesData);
      setActivityReviews(reviewsData);
      setSharedItineraries(itinerariesData);
    } catch (err) {
      console.error("Error fetching community data:", err);
      toast.error("Failed to load community data", {
        description: "Please try refreshing the page",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCommunityData();
  }, []);

  useEffect(() => {
    localStorage.setItem(COMMUNITY_PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  const handleProfileChange = (field: keyof CommunityProfile, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleShareItinerary = async () => {
    if (shareableActivities.length === 0) {
      toast.error("No activities to share", {
        description: "Book at least one activity before sharing your itinerary.",
      });
      return;
    }

    const trimmedTitle = shareTitle.trim();
    const trimmedDescription = shareDescription.trim();

    if (!trimmedTitle || !trimmedDescription) {
      toast.error("Add a title and description", {
        description: "Give other guests enough context before you share.",
      });
      return;
    }

    const parsedTags = shareTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload: CreateSharedItineraryInput = {
      userName: profile.userName.trim() || "Simalem Guest",
      userAvatar: profile.userAvatar.trim() || undefined,
      title: trimmedTitle,
      description: trimmedDescription,
      activityIds: shareableActivities.map((activity) => activity.id),
      tags: parsedTags.length > 0 ? parsedTags : buildDerivedTags(shareableActivities),
    };

    try {
      setIsSubmittingItinerary(true);
      const createdItinerary = await createSharedItinerary(payload);
      setSharedItineraries((current) => [createdItinerary, ...current]);
      setShareTitle("");
      setShareDescription("");
      setShareTags("");
      setSelectedTab("itineraries");
      toast.success("Itinerary shared", {
        description: "Your itinerary is now visible in the community hub.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We could not share your itinerary right now.";
      toast.error("Failed to share itinerary", {
        description: message,
      });
    } finally {
      setIsSubmittingItinerary(false);
    }
  };

  const handleSubmitReview = async () => {
    const trimmedComment = reviewComment.trim();

    if (!reviewActivityId) {
      toast.error("Choose an activity", {
        description: "Select the activity you want to review first.",
      });
      return;
    }

    if (!trimmedComment) {
      toast.error("Add your review", {
        description: "Share a few words about your experience.",
      });
      return;
    }

    const payload: CreateActivityReviewInput = {
      activityId: reviewActivityId,
      userName: profile.userName.trim() || "Simalem Guest",
      userAvatar: profile.userAvatar.trim() || undefined,
      rating: reviewRating,
      comment: trimmedComment,
    };

    try {
      setIsSubmittingReview(true);
      const createdReview = await createActivityReview(payload);
      setActivityReviews((current) => [createdReview, ...current]);
      setSelectedActivityFilter(createdReview.activityId);
      setReviewComment("");
      setReviewRating(5);
      setReviewActivityId("");
      toast.success("Review posted", {
        description: "Thanks for helping other guests discover great experiences.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We could not submit your review right now.";
      toast.error("Failed to post review", {
        description: message,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 py-16 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold">Community Hub</h1>
          <p className="max-w-2xl text-lg text-white/90">
            Discover inspiring itineraries from fellow travelers and share your experiences.
            Get authentic insights from our community of conscious explorers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading community data...</p>
            </div>
          </div>
        ) : (
          <>
            <Card className="mb-8 border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Guest Community Profile</CardTitle>
                <CardDescription>
                  This name and avatar will be used when you share itineraries or post reviews.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Display name</label>
                  <Input
                    value={profile.userName}
                    onChange={(event) => handleProfileChange("userName", event.target.value)}
                    placeholder="Simalem Guest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Avatar URL (optional)</label>
                  <Input
                    value={profile.userAvatar}
                    onChange={(event) => handleProfileChange("userAvatar", event.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="itineraries">Shared Itineraries</TabsTrigger>
                <TabsTrigger value="reviews">Activity Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="itineraries" className="space-y-6">
                <Card className="border-emerald-100 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-emerald-600" />
                      Share Your Itinerary
                    </CardTitle>
                    <CardDescription>
                      Publish the activities you have booked so other guests can discover them.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shareableActivities.length > 0 ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Itinerary title</label>
                            <Input
                              value={shareTitle}
                              onChange={(event) => setShareTitle(event.target.value)}
                              placeholder="Example: Quiet cultural weekend at Simalem"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tags (optional)</label>
                            <Input
                              value={shareTags}
                              onChange={(event) => setShareTags(event.target.value)}
                              placeholder="culture, low impact, family friendly"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <Textarea
                            value={shareDescription}
                            onChange={(event) => setShareDescription(event.target.value)}
                            placeholder="Tell other guests why this itinerary worked well for you."
                            rows={4}
                          />
                        </div>

                        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                          <p className="text-sm font-medium text-gray-700">
                            Activities to be shared ({shareableActivities.length})
                          </p>
                          <div className="grid gap-3 md:grid-cols-2">
                            {shareableActivities.map((activity) => (
                              <div
                                key={activity.id}
                                className="rounded-xl border border-gray-200 bg-white p-3"
                              >
                                <p className="font-semibold text-gray-900">{activity.name}</p>
                                <p className="mt-1 text-sm text-gray-600">
                                  {formatDurationDisplay(activity.duration)} - ${activity.price}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={handleShareItinerary}
                          disabled={isSubmittingItinerary}
                        >
                          {isSubmittingItinerary ? "Sharing itinerary..." : "Share My Itinerary"}
                        </Button>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center">
                        <p className="text-sm text-gray-700">
                          Book a few activities first, then come back here to share your itinerary.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => navigate("/activities")}
                        >
                          Explore Activities
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {sharedItineraries.map((itinerary) => (
                    <Card key={itinerary.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <img
                            src={itinerary.userAvatar}
                            alt={itinerary.userName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <CardTitle className="mb-1 text-xl">{itinerary.title}</CardTitle>
                            <CardDescription>
                              by {itinerary.userName} - {new Date(itinerary.sharedDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">{itinerary.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {itinerary.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="mb-4 space-y-3">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            Activities ({itinerary.activities.length})
                          </h4>
                          {itinerary.activities.map((activity, idx) => (
                            <div key={`${itinerary.id}-${activity.id}-${idx}`} className="flex gap-3 rounded-lg bg-gray-50 p-3">
                              <img
                                src={activity.image}
                                alt={activity.name}
                                className="h-16 w-16 rounded object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-semibold">{activity.name}</h5>
                                <p className="mt-1 text-xs text-gray-600">
                                  {formatDurationDisplay(activity.duration)} - ${activity.price}
                                </p>
                                <div className="mt-1 flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-xs">
                                    <Users className="h-3 w-3 text-blue-600" />
                                    <span className="font-medium text-blue-600">
                                      {activity.communityImpact === "Direct Local Partner"
                                        ? "DLP"
                                        : activity.communityImpact === "Internal Community Support"
                                          ? "ICS"
                                          : "NDL"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <Leaf className="h-3 w-3 text-emerald-600" />
                                    <span className="font-medium text-emerald-600">
                                      {activity.environmentalImpact}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-6 border-t pt-4">
                          <button className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-emerald-600">
                            <Heart className="h-4 w-4" />
                            <span>{itinerary.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-emerald-600">
                            <MessageCircle className="h-4 w-4" />
                            <span>{itinerary.comments}</span>
                          </button>
                          <button className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-emerald-600">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Share Your Experience</CardTitle>
                    <CardDescription>
                      Post a review to help other guests choose the right activity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Select Activity</label>
                      <select
                        value={reviewActivityId}
                        onChange={(event) => setReviewActivityId(event.target.value)}
                        className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">Choose an activity...</option>
                        {activities.map((activity) => (
                          <option key={activity.id} value={activity.id}>
                            {activity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Rating</label>
                      <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const ratingValue = idx + 1;
                          const isActive = ratingValue <= reviewRating;

                          return (
                            <button
                              key={ratingValue}
                              type="button"
                              onClick={() => setReviewRating(ratingValue)}
                              className="transition-transform hover:scale-105"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Your Review</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        placeholder="Share your experience with this activity..."
                        rows={4}
                      />
                    </div>

                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? "Submitting review..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>

                <div className="mb-2 overflow-x-auto pb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedActivityFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedActivityFilter("all")}
                      className={selectedActivityFilter === "all" ? "bg-emerald-600" : ""}
                    >
                      All Activities
                    </Button>
                    {activities.map((activity) => (
                      <Button
                        key={activity.id}
                        variant={selectedActivityFilter === activity.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedActivityFilter(activity.id)}
                        className={selectedActivityFilter === activity.id ? "bg-emerald-600" : ""}
                      >
                        {activity.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{review.userName}</h4>
                                <p className="text-sm text-gray-600">{review.activityName}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star
                                      key={idx}
                                      className={`h-4 w-4 ${
                                        idx < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <p className="mb-4 text-gray-700">{review.comment}</p>

                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-emerald-600">
                                <ThumbsUp className="h-4 w-4" />
                                <span>Helpful ({review.helpful})</span>
                              </button>
                              <button className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-emerald-600">
                                <MessageCircle className="h-4 w-4" />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
