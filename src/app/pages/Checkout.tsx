import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Check, CreditCard, Heart, Leaf, Users } from "lucide-react";
import { toast } from "sonner";
import { useBooking } from "../context/BookingContext";
import { useGuestStay } from "../context/GuestStayContext";
import { formatDurationDisplay } from "../../utils/formatters";
import {
  buildBoardCharges,
  getStayLength,
  parseStayDate,
} from "../../utils/stayCharges";

function formatStayDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return parseStayDate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Checkout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { bookedActivities } = useBooking();
  const { profile, hasStayDetails } = useGuestStay();

  const stayCharges = useMemo(
    () => buildBoardCharges(profile.checkInDate, profile.checkOutDate),
    [profile.checkInDate, profile.checkOutDate],
  );

  const stayNights = useMemo(
    () => getStayLength(profile.checkInDate, profile.checkOutDate),
    [profile.checkInDate, profile.checkOutDate],
  );

  const staySubtotal = useMemo(
    () => stayCharges.reduce((sum, charge) => sum + charge.amount, 0),
    [stayCharges],
  );

  const activitySubtotal = useMemo(
    () => bookedActivities.reduce((sum, activity) => sum + activity.price, 0),
    [bookedActivities],
  );

  const subtotal = staySubtotal + activitySubtotal;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const lowImpactActivities = bookedActivities.filter(
    (activity) => activity.environmentalImpact === "Low",
  ).length;
  const communityPartnerActivities = bookedActivities.filter(
    (activity) => activity.communityImpact === "Direct Local Partner",
  ).length;
  const farmSourcedMeals = stayCharges.filter((charge) =>
    charge.description.toLowerCase().includes("farm-sourced"),
  ).length;

  const handleCompleteCheckout = () => {
    setIsProcessing(true);

    toast.success("Payment Confirmed!", {
      description: "Thank you for staying with us. Safe travels!",
    });

    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold">Final Checkout</h1>
          <p className="text-white/90">
            Thank you for staying with us at Simalem Resort
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!hasStayDetails ? (
          <Card className="mx-auto mb-8 max-w-3xl border-sky-200 bg-sky-50">
            <CardHeader>
              <CardTitle>Complete your stay details first</CardTitle>
              <CardDescription>
                Add your name and stay dates so we can calculate room, lunch, and
                dinner charges automatically before checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/guest-stay?returnTo=/checkout">Add stay details</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/activities">Back to activities</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Stay Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Guest Name</p>
                    <p className="font-semibold">{profile.guestName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Number</p>
                    <p className="font-semibold">{profile.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-In</p>
                    <p className="font-semibold">{formatStayDate(profile.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-Out</p>
                    <p className="font-semibold">{formatStayDate(profile.checkOutDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-emerald-600" />
                  <CardTitle className="text-emerald-900">Your Stay Impact</CardTitle>
                </div>
                <CardDescription className="text-gray-700">
                  During your time at Simalem:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-gray-700">
                      You selected{" "}
                      <span className="font-semibold text-emerald-700">
                        {lowImpactActivities} low environmental-intensity experiences
                      </span>
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-gray-700">
                      You joined{" "}
                      <span className="font-semibold text-blue-700">
                        {communityPartnerActivities} activities led by local community partners
                      </span>
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Check className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-gray-700">
                      You chose{" "}
                      <span className="font-semibold text-amber-700">
                        {farmSourcedMeals} farm-sourced dining moments during your stay
                      </span>
                    </p>
                  </div>
                </div>

                <Separator className="bg-emerald-200" />

                <p className="text-sm italic text-gray-700">
                  Your choices support Simalem&apos;s commitment to environmental
                  stewardship and community uplift.
                </p>

                <p className="text-center text-base font-semibold text-emerald-900">
                  Thank you for being part of our purpose.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itemized Charges</CardTitle>
                <CardDescription>
                  {stayNights} nights | {formatStayDate(profile.checkInDate)} -{" "}
                  {formatStayDate(profile.checkOutDate)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Room And Boarding
                  </h3>
                  {stayCharges.length > 0 ? (
                    <div className="space-y-2">
                      {stayCharges.map((charge, index) => (
                        <div
                          key={`${charge.date}-${charge.description}-${index}`}
                          className="flex justify-between border-b border-gray-100 py-2 text-sm last:border-0"
                        >
                          <div>
                            <span className="text-xs text-gray-500">{charge.date}</span>
                            <p className="text-gray-700">{charge.description}</p>
                          </div>
                          <span className="font-medium">${charge.amount}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      Add your stay dates to generate room and board charges.
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Activities Booked
                  </h3>
                  {bookedActivities.length > 0 ? (
                    <div className="space-y-2">
                      {bookedActivities.map((activity, index) => (
                        <div
                          key={`${activity.id}-${activity.bookingTime ?? "unbooked"}-${index}`}
                          className="flex justify-between border-b border-gray-100 py-2 text-sm last:border-0"
                        >
                          <div>
                            <span className="text-xs text-gray-500">
                              {activity.bookingDate
                                ? new Date(activity.bookingDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Scheduled activity"}
                              {activity.bookingTime ? ` | ${activity.bookingTime}` : ""}
                            </span>
                            <p className="text-gray-700">
                              {activity.name} ({formatDurationDisplay(activity.duration)})
                            </p>
                          </div>
                          <span className="font-medium">${activity.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      No activities booked yet.
                    </div>
                  )}

                  <div className="mt-4 flex justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    <span>Total Activities Booked</span>
                    <span>${activitySubtotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <CardTitle>Payment Summary</CardTitle>
                </div>
                <CardDescription>Final amount due</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room & Boarding</span>
                    <span className="font-medium">${staySubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Activities Booked</span>
                    <span className="font-medium">${activitySubtotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="border-t-2" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Due</span>
                    <span className="text-emerald-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Card on File</p>
                      <p className="text-xs text-gray-500">**** 4242</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  onClick={handleCompleteCheckout}
                  disabled={isProcessing || !hasStayDetails}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Complete Checkout - $${total.toFixed(2)}`}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  By completing checkout, you confirm all charges are accurate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
