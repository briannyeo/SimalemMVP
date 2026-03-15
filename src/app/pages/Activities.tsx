import { useState, useEffect } from "react";
import { ActivityCard } from "../components/ActivityCard";
import { BookingModal } from "../components/BookingModal";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useBooking } from "../context/BookingContext";
import type { Activity } from "../../types";
import { fetchActivities } from "../../services/api";
import { toast } from "sonner";

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addActivity } = useBooking();

  // Fetch activities from database
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActivities();
        setActivities(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
        setError(errorMessage);
        console.error('Error fetching activities:', err);
        toast.error('Failed to load activities', {
          description: 'Please try refreshing the page'
        });
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const handleBookClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = (activity: Activity, date: Date, time: string) => {
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
    selectedCategory === "all"
      ? activities
      : activities.filter(
          (a) => a.category.toLowerCase() === selectedCategory,
        );

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
          <h1 className="text-4xl font-bold mb-4">
            Discover Our Activities
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Experience meaningful adventures that benefit both
            local communities and the environment. Each activity
            contributes to our sustainability goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">
                All Activities
              </TabsTrigger>
              <TabsTrigger value="cultural">
                Cultural
              </TabsTrigger>
              <TabsTrigger value="environmental">
                Environmental
              </TabsTrigger>
              <TabsTrigger value="adventure">
                Adventure
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
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