import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Star, 
  ThumbsUp,
  Calendar,
  Users,
  Leaf,
  Bookmark
} from "lucide-react";
import type { Activity, ActivityReview, SharedItinerary } from "../../types";
import { fetchActivities, fetchActivityReviews, fetchSharedItineraries } from "../../services/api";
import { toast } from "sonner";

export function Community() {
  const [selectedTab, setSelectedTab] = useState("itineraries");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState("all");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityReviews, setActivityReviews] = useState<ActivityReview[]>([]);
  const [sharedItineraries, setSharedItineraries] = useState<SharedItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [activitiesData, reviewsData, itinerariesData] = await Promise.all([
          fetchActivities(),
          fetchActivityReviews(),
          fetchSharedItineraries(),
        ]);

        setActivities(activitiesData);
        setActivityReviews(reviewsData);
        setSharedItineraries(itinerariesData);

      } catch (err) {
        console.error('Error fetching community data:', err);
        toast.error('Failed to load community data', {
          description: 'Please try refreshing the page'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredReviews = selectedActivityFilter === "all" 
    ? activityReviews 
    : activityReviews.filter(review => review.activityId === selectedActivityFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            Community Hub
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="itineraries">
                Shared Itineraries
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Activity Reviews
              </TabsTrigger>
            </TabsList>

            {/* Shared Itineraries Tab */}
            <TabsContent value="itineraries">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sharedItineraries.map((itinerary) => (
                  <Card key={itinerary.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <img
                          src={itinerary.userAvatar}
                          alt={itinerary.userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">
                            {itinerary.title}
                          </CardTitle>
                          <CardDescription>
                            by {itinerary.userName} • {new Date(itinerary.sharedDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        {itinerary.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {itinerary.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                          Activities ({itinerary.activities.length})
                        </h4>
                        {itinerary.activities.map((activity, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm">
                                {activity.name}
                              </h5>
                              <p className="text-xs text-gray-600 mt-1">
                                {activity.duration} • ${activity.price}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <Users className="h-3 w-3 text-blue-600" />
                                  <span className="text-blue-600 font-medium">
                                    {activity.communityImpact === "Direct Local Partner" ? "DLP" : 
                                     activity.communityImpact === "Internal Community Support" ? "ICS" : "NDL"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <Leaf className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-medium">
                                    {activity.environmentalImpact}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-6 pt-4 border-t">
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{itinerary.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{itinerary.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Reviews Tab */}
            <TabsContent value="reviews">
              <div className="mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.userName}</h4>
                              <p className="text-sm text-gray-600">
                                {review.activityName}
                              </p>
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
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">
                            {review.comment}
                          </p>

                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
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

              {/* Add Review Section */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Share Your Experience</CardTitle>
                  <CardDescription>
                    Help fellow travelers by sharing your thoughts on activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Select Activity
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Choose an activity...</option>
                        {activities.map((activity) => (
                          <option key={activity.id} value={activity.id}>
                            {activity.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button key={idx}>
                            <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Review
                      </label>
                      <Textarea
                        placeholder="Share your experience with this activity..."
                        rows={4}
                      />
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Submit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}