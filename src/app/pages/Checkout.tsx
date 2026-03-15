import { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  Users,
  Leaf,
  Heart,
  CreditCard,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// Mock data for guest's stay
const mockStayData = {
  guestName: "Sarah Johnson",
  roomNumber: "203",
  checkInDate: "Feb 18, 2026",
  checkOutDate: "Feb 22, 2026",
  nights: 4,
  roomRate: 180,
  charges: [
    {
      date: "Feb 18",
      description: "Room - Deluxe Lake View",
      amount: 180,
    },
    {
      date: "Feb 18",
      description: "Farm-sourced Dinner",
      amount: 45,
    },
    {
      date: "Feb 19",
      description: "Room - Deluxe Lake View",
      amount: 180,
    },
    {
      date: "Feb 19",
      description: "Traditional Batak Cooking Class",
      amount: 75,
    },
    {
      date: "Feb 19",
      description: "Farm-sourced Lunch",
      amount: 35,
    },
    {
      date: "Feb 20",
      description: "Room - Deluxe Lake View",
      amount: 180,
    },
    {
      date: "Feb 20",
      description: "Lake Toba Kayaking",
      amount: 60,
    },
    {
      date: "Feb 20",
      description: "Farm-sourced Dinner",
      amount: 45,
    },
    {
      date: "Feb 21",
      description: "Room - Deluxe Lake View",
      amount: 180,
    },
    { date: "Feb 23", description: "ATV Trail", amount: 50 },
    {
      date: "Feb 21",
      description: "Farm-sourced Breakfast",
      amount: 25,
    },
  ],
  impactSummary: {
    lowIntensityActivities: 2,
    communityPartnerActivities: 1,
    farmSourcedMeals: 4,
  },
};

export function Checkout() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = mockStayData.charges.reduce(
    (sum, charge) => sum + charge.amount,
    0,
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCompleteCheckout = () => {
    setIsProcessing(true);

    toast.success("Payment Confirmed!", {
      description:
        "Thank you for staying with us. Safe travels!",
    });

    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, this would redirect to a confirmation page
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">
            Final Checkout
          </h1>
          <p className="text-white/90">
            Thank you for staying with us at Simalem Resort
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stay Impact Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Guest Name
                    </p>
                    <p className="font-semibold">
                      {mockStayData.guestName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Room Number
                    </p>
                    <p className="font-semibold">
                      {mockStayData.roomNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Check-In
                    </p>
                    <p className="font-semibold">
                      {mockStayData.checkInDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Check-Out
                    </p>
                    <p className="font-semibold">
                      {mockStayData.checkOutDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-emerald-600" />
                  <CardTitle className="text-emerald-900">
                    Your Stay Impact
                  </CardTitle>
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
                        {
                          mockStayData.impactSummary
                            .lowIntensityActivities
                        }{" "}
                        low environmental-intensity experiences
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
                        {
                          mockStayData.impactSummary
                            .communityPartnerActivities
                        }{" "}
                        activity led by a local community
                        partner
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
                        farm-sourced dining during your stay
                      </span>
                    </p>
                  </div>
                </div>

                <Separator className="bg-emerald-200" />

                <p className="text-sm text-gray-700 italic">
                  Your choices support Simalem's commitment to
                  environmental stewardship and community
                  uplift.
                </p>

                <p className="text-base font-semibold text-emerald-900 text-center">
                  Thank you for being part of our purpose.
                </p>
              </CardContent>
            </Card>

            {/* Itemized Charges */}
            <Card>
              <CardHeader>
                <CardTitle>Itemized Charges</CardTitle>
                <CardDescription>
                  {mockStayData.nights} nights •{" "}
                  {mockStayData.checkInDate} -{" "}
                  {mockStayData.checkOutDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockStayData.charges.map((charge, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <span className="text-gray-500 text-xs">
                          {charge.date}
                        </span>
                        <p className="text-gray-700">
                          {charge.description}
                        </p>
                      </div>
                      <span className="font-medium">
                        ${charge.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <CardTitle>Payment Summary</CardTitle>
                </div>
                <CardDescription>
                  Final amount due
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Room ({mockStayData.nights} nights)
                    </span>
                    <span className="font-medium">
                      $
                      {mockStayData.roomRate *
                        mockStayData.nights}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Activities & Dining
                    </span>
                    <span className="font-medium">
                      $
                      {subtotal -
                        mockStayData.roomRate *
                          mockStayData.nights}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      ${subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Tax (10%)
                    </span>
                    <span className="font-medium">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="border-t-2" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Due</span>
                    <span className="text-emerald-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Card on File
                      </p>
                      <p className="text-xs text-gray-500">
                        •••• 4242
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  onClick={handleCompleteCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Complete Checkout - $${total.toFixed(2)}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By completing checkout, you confirm all
                  charges are accurate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}