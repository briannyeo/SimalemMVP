import { useState } from "react";
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
import { mockGuestBookings } from "../data/mockGuestBookings";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

export function Admin() {
  const [selectedGuest, setSelectedGuest] = useState<
    string | null
  >(null);

  // Calculate totals
  const totalGuests = mockGuestBookings.length;
  const totalBookings = mockGuestBookings.reduce(
    (sum, guest) => sum + guest.activities.length,
    0,
  );
  const totalRevenue = mockGuestBookings.reduce(
    (sum, guest) =>
      sum +
      guest.activities.reduce(
        (actSum, act) => actSum + act.price,
        0,
      ),
    0,
  );
  const avgCommunityRatio = mockGuestBookings.length > 0
    ? (mockGuestBookings.reduce((sum, guest) => {
        const directPartnerCount = guest.activities.filter(
          (act) => act.communityImpact === 'Direct Local Partner',
        ).length;
        const ratio = guest.activities.length > 0
          ? directPartnerCount / guest.activities.length
          : 0;
        return sum + ratio;
      }, 0) / mockGuestBookings.length).toFixed(2)
    : '0.00';
  const avgEnvironmentalRatio = mockGuestBookings.length > 0
    ? (mockGuestBookings.reduce((sum, guest) => {
        const lowEnvCount = guest.activities.filter(
          (act) => act.environmentalImpact === 'Low',
        ).length;
        const ratio = guest.activities.length > 0
          ? lowEnvCount / guest.activities.length
          : 0;
        return sum + ratio;
      }, 0) / mockGuestBookings.length).toFixed(2)
    : '0.00';
  const purposeEngagementRatio = mockGuestBookings.length > 0
    ? ((parseFloat(avgCommunityRatio) + parseFloat(avgEnvironmentalRatio)) / 2).toFixed(2)
    : '0.00';
  const totalDirectPartnerActivities = mockGuestBookings.reduce(
    (sum, guest) =>
      sum +
      guest.activities.filter(
        (act) => act.communityImpact === 'Direct Local Partner',
      ).length,
    0,
  );
  const totalLowEnvironmentalActivities = mockGuestBookings.reduce(
    (sum, guest) =>
      sum +
      guest.activities.filter(
        (act) => act.environmentalImpact === 'Low',
      ).length,
    0,
  );

  const selectedGuestData = selectedGuest
    ? mockGuestBookings.find((g) => g.guestId === selectedGuest)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">
            Supervisor Portal
          </h1>
          <p className="text-emerald-50">
            Monitor guest bookings and track sustainability
            impact
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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
                <span>Current period</span>
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
                <span>From activities</span>
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

        {/* Guest Bookings */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Guests</TabsTrigger>
            <TabsTrigger value="details">
              Guest Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Guest Bookings Overview</CardTitle>
                <CardDescription>
                  View all guest activities and their impact
                  contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    {mockGuestBookings.map((guest) => {
                      const totalCost = guest.activities.reduce(
                        (sum, act) => sum + act.price,
                        0,
                      );
                      const directPartnerCount = guest.activities.filter(
                        (act) => act.communityImpact === 'Direct Local Partner',
                      ).length;
                      const communityRatio = guest.activities.length > 0
                        ? (directPartnerCount / guest.activities.length)
                        : 0;
                      const lowEnvCount = guest.activities.filter(
                        (act) => act.environmentalImpact === 'Low',
                      ).length;
                      const environmentalRatio = guest.activities.length > 0
                        ? (lowEnvCount / guest.activities.length)
                        : 0;
                      const per = ((communityRatio + environmentalRatio) / 2).toFixed(2);

                      return (
                        <TableRow
                          key={guest.guestId}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setSelectedGuest(guest.guestId)
                          }
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {guest.guestName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {guest.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {guest.roomNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              guest.checkInDate,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              guest.checkoutDate,
                            ).toLocaleDateString()}
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
                            <span className="text-blue-600 font-semibold">
                              {communityRatio.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-emerald-600 font-semibold">
                              {environmentalRatio.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-purple-600 font-semibold">
                              {per}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGuest(guest.guestId);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                              View Details
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            {selectedGuestData ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedGuestData.guestName}
                    </CardTitle>
                    <CardDescription>
                      {selectedGuestData.email} • Room{" "}
                      {selectedGuestData.roomNumber} • Check-in:{" "}
                      {new Date(
                        selectedGuestData.checkInDate,
                      ).toLocaleDateString()}{" "}
                      • Checkout:{" "}
                      {new Date(
                        selectedGuestData.checkoutDate,
                      ).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booked Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedGuestData.activities.map(
                        (activity, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 border rounded-lg"
                          >
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {activity.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {activity.duration} •{" "}
                                    {activity.category}
                                  </p>
                                  {activity.bookingDate && activity.bookingTime && (
                                    <p className="text-sm text-emerald-700 font-medium mt-1">
                                      📅 {new Date(activity.bookingDate).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })} at {activity.bookingTime}
                                    </p>
                                  )}
                                </div>
                                <div className="text-lg font-semibold">
                                  ${activity.price}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-600 font-semibold">
                                    {activity.communityImpact}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Leaf className="h-4 w-4 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">
                                    {activity.environmentalImpact}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Select a guest from the "All Guests" tab to
                  view their booking details
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}