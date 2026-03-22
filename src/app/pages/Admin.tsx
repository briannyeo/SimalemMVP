import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Leaf,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { fetchGuestBookings } from "../../services/api";
import type { GuestBooking } from "../../types";
import { getBoardSubtotal } from "../../utils/stayCharges";

export function Admin() {
  const [guestBookings, setGuestBookings] = useState<GuestBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  useEffect(() => {
    const loadGuestBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const liveGuestBookings = await fetchGuestBookings();
        setGuestBookings(liveGuestBookings);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load guest bookings";
        setError(errorMessage);
        console.error("Error fetching guest bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadGuestBookings();
  }, []);

  const totalGuests = guestBookings.length;
  const totalBookings = guestBookings.reduce(
    (sum, guest) => sum + guest.activities.length,
    0,
  );
  const totalRevenue = guestBookings.reduce(
    (sum, guest) =>
      sum +
      getBoardSubtotal(guest.checkInDate, guest.checkoutDate) +
      guest.activities.reduce(
        (activitySum, activity) => activitySum + activity.price,
        0,
      ),
    0,
  );
  const avgCommunityRatio = guestBookings.length > 0
    ? (guestBookings.reduce((sum, guest) => {
        const directPartnerCount = guest.activities.filter(
          (activity) => activity.communityImpact === "Direct Local Partner",
        ).length;
        const ratio = guest.activities.length > 0
          ? directPartnerCount / guest.activities.length
          : 0;
        return sum + ratio;
      }, 0) / guestBookings.length).toFixed(2)
    : "0.00";
  const avgEnvironmentalRatio = guestBookings.length > 0
    ? (guestBookings.reduce((sum, guest) => {
        const lowImpactCount = guest.activities.filter(
          (activity) => activity.environmentalImpact === "Low",
        ).length;
        const ratio = guest.activities.length > 0
          ? lowImpactCount / guest.activities.length
          : 0;
        return sum + ratio;
      }, 0) / guestBookings.length).toFixed(2)
    : "0.00";
  const purposeEngagementRatio = guestBookings.length > 0
    ? ((parseFloat(avgCommunityRatio) + parseFloat(avgEnvironmentalRatio)) / 2).toFixed(2)
    : "0.00";
  const activityPerformance = useMemo(() => {
    const performanceMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        bookings: number;
        revenue: number;
        guestIds: Set<string>;
      }
    >();

    guestBookings.forEach((guest) => {
      guest.activities.forEach((activity) => {
        const currentActivity = performanceMap.get(activity.id);

        if (currentActivity) {
          currentActivity.bookings += 1;
          currentActivity.revenue += activity.price;
          currentActivity.guestIds.add(guest.guestId);
          return;
        }

        performanceMap.set(activity.id, {
          id: activity.id,
          name: activity.name,
          category: activity.category,
          bookings: 1,
          revenue: activity.price,
          guestIds: new Set([guest.guestId]),
        });
      });
    });

    return Array.from(performanceMap.values())
      .map((activity) => ({
        ...activity,
        uniqueGuests: activity.guestIds.size,
      }))
      .sort((left, right) => {
        if (right.bookings !== left.bookings) {
          return right.bookings - left.bookings;
        }

        return right.revenue - left.revenue;
      });
  }, [guestBookings]);
  const topBookedActivity = activityPerformance[0] ?? null;
  const topRevenueActivity = [...activityPerformance].sort(
    (left, right) => right.revenue - left.revenue,
  )[0] ?? null;

  const selectedGuestData = useMemo(
    () =>
      selectedGuest
        ? guestBookings.find((guest) => guest.guestId === selectedGuest) ?? null
        : null,
    [guestBookings, selectedGuest],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold">
            Supervisor Portal
          </h1>
          <p className="text-emerald-50">
            Monitor guest bookings and track sustainability impact
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Guests</CardDescription>
              <CardTitle className="text-3xl">
                {totalGuests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Live guest stays</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">
                {totalBookings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Activities booked</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Revenue</CardDescription>
              <CardTitle className="text-3xl">
                ${totalRevenue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>Room, board, and activities</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>
                Community Impact
              </CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {avgCommunityRatio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Users className="h-4 w-4" />
                <span>Average ratio</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>
                Environmental Impact
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-600">
                {avgEnvironmentalRatio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Leaf className="h-4 w-4" />
                <span>Average ratio</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>
                Purpose Engagement
              </CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {purposeEngagementRatio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span>Average ratio</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Guests</TabsTrigger>
            <TabsTrigger value="activity-rates">
              Activity Rates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Guest Bookings Overview</CardTitle>
                <CardDescription>
                  View live guest activities and their impact contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-12 text-center text-gray-500">
                    Loading live guest bookings...
                  </div>
                ) : error ? (
                  <div className="py-12 text-center">
                    <p className="font-medium text-red-600">{error}</p>
                  </div>
                ) : guestBookings.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    No live guest bookings yet. Once guests save their stay details and
                    activities, they will appear here.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest Name</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Checkout</TableHead>
                        <TableHead className="text-center">
                          Activities
                        </TableHead>
                        <TableHead className="text-right">
                          Total Cost
                        </TableHead>
                        <TableHead className="text-center">
                          Community
                        </TableHead>
                        <TableHead className="text-center">
                          Environmental
                        </TableHead>
                        <TableHead className="text-center">
                          PER
                        </TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guestBookings.map((guest) => {
                        const totalCost =
                          getBoardSubtotal(guest.checkInDate, guest.checkoutDate) +
                          guest.activities.reduce(
                            (sum, activity) => sum + activity.price,
                            0,
                          );
                        const directPartnerCount = guest.activities.filter(
                          (activity) => activity.communityImpact === "Direct Local Partner",
                        ).length;
                        const communityRatio = guest.activities.length > 0
                          ? directPartnerCount / guest.activities.length
                          : 0;
                        const lowImpactCount = guest.activities.filter(
                          (activity) => activity.environmentalImpact === "Low",
                        ).length;
                        const environmentalRatio = guest.activities.length > 0
                          ? lowImpactCount / guest.activities.length
                          : 0;
                        const per = ((communityRatio + environmentalRatio) / 2).toFixed(2);

                        return (
                          <TableRow
                            key={guest.guestId}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {guest.guestName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {guest.email || "Not provided"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {guest.roomNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(guest.checkInDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(guest.checkoutDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                {guest.activities.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${totalCost}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-semibold text-blue-600">
                                {communityRatio.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-semibold text-emerald-600">
                                {environmentalRatio.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-semibold text-purple-600">
                                {per}
                              </span>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedGuest(guest.guestId);
                                }}
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                              >
                                View Details
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity-rates">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription>Most Popular Activity</CardDescription>
                    <CardTitle>
                      {topBookedActivity?.name ?? "No activity bookings yet"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {topBookedActivity
                        ? `${topBookedActivity.bookings} bookings across ${topBookedActivity.uniqueGuests} guest stays`
                        : "Guest activity bookings will appear here once live data comes in."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Highest Activity Revenue</CardDescription>
                    <CardTitle>
                      {topRevenueActivity?.name ?? "No activity revenue yet"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {topRevenueActivity
                        ? `$${topRevenueActivity.revenue} from ${topRevenueActivity.bookings} bookings`
                        : "Revenue ranking will appear once guests start booking activities."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Booking Rates</CardTitle>
                  <CardDescription>
                    Ranked by booking volume, with revenue contribution for each activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-12 text-center text-gray-500">
                      Loading activity performance...
                    </div>
                  ) : error ? (
                    <div className="py-12 text-center">
                      <p className="font-medium text-red-600">{error}</p>
                    </div>
                  ) : activityPerformance.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      No activity bookings yet. This ranking will populate from live guest
                      booking data.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-center">Bookings</TableHead>
                          <TableHead className="text-center">Guests</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityPerformance.map((activity, index) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-semibold text-gray-600">
                              #{index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {activity.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{activity.category}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {activity.bookings}
                            </TableCell>
                            <TableCell className="text-center">
                              {activity.uniqueGuests}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${activity.revenue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={Boolean(selectedGuestData)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGuest(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          {selectedGuestData && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedGuestData.guestName}</DialogTitle>
                <DialogDescription>
                  {selectedGuestData.email || "Not provided"} | Room{" "}
                  {selectedGuestData.roomNumber} | Check-in:{" "}
                  {new Date(
                    selectedGuestData.checkInDate,
                  ).toLocaleDateString()}{" "}
                  | Checkout:{" "}
                  {new Date(
                    selectedGuestData.checkoutDate,
                  ).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booked Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedGuestData.activities.length > 0 ? (
                      <div className="space-y-4">
                        {selectedGuestData.activities.map((activity, index) => (
                          <div
                            key={`${selectedGuestData.guestId}-${activity.id}-${index}`}
                            className="flex gap-4 rounded-lg border p-4"
                          >
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="h-24 w-24 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {activity.name}
                                  </h4>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {activity.duration} | {activity.category}
                                  </p>
                                  {activity.bookingDate && activity.bookingTime && (
                                    <p className="mt-1 text-sm font-medium text-emerald-700">
                                      Scheduled:{" "}
                                      {new Date(activity.bookingDate).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}{" "}
                                      at {activity.bookingTime}
                                    </p>
                                  )}
                                </div>
                                <div className="text-lg font-semibold">
                                  ${activity.price}
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold text-blue-600">
                                    {activity.communityImpact}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Leaf className="h-4 w-4 text-emerald-600" />
                                  <span className="font-semibold text-emerald-600">
                                    {activity.environmentalImpact}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        This guest has stay details saved but no booked activities yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
