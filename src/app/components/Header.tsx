import { Link, useLocation, useNavigate } from "react-router";
import { Mountain, LogOut } from "lucide-react";
import { useAiItinerary } from "../context/AiItineraryContext";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { useGuestInterest } from "../context/GuestInterestContext";
import { useGuestStay } from "../context/GuestStayContext";
import { Button } from "./ui/button";

export function Header() {
  const { clearAllItineraries } = useAiItinerary();
  const { userRole, logout } = useAuth();
  const { clearBookings } = useBooking();
  const { clearProfile } = useGuestInterest();
  const { clearProfile: clearStayProfile } = useGuestStay();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (userRole === "guest") {
      clearProfile();
      clearStayProfile();
      clearBookings();
      clearAllItineraries();
      localStorage.removeItem("simalem_community_profile");
    }
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link
          to={
            userRole === "supervisor" ? "/admin" : "/activities"
          }
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Mountain className="h-6 w-6 text-emerald-600" />
          <span className="text-lg font-semibold sm:text-xl">
            Simalem Resort
          </span>
        </Link>

        <nav className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 sm:w-auto sm:justify-end sm:gap-6">
          {userRole === "guest" && (
            <>
              <Link
                to="/activities"
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  location.pathname === "/activities"
                    ? "text-emerald-600"
                    : "text-gray-600"
                }`}
              >
                Activities
              </Link>

              <Link
                to="/community"
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  location.pathname === "/community"
                    ? "text-emerald-600"
                    : "text-gray-600"
                }`}
              >
                Community
              </Link>

              <Link
                to="/summary"
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  location.pathname === "/summary"
                    ? "text-emerald-600"
                    : "text-gray-600"
                }`}
              >
                Itinerary
              </Link>

              <Link to="/checkout">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <span className="sm:hidden">Checkout</span>
                  <span className="hidden sm:inline">Final Checkout</span>
                </Button>
              </Link>
            </>
          )}

          {userRole === "supervisor" && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                location.pathname === "/admin"
                  ? "text-emerald-600"
                  : "text-gray-600"
              }`}
            >
              Dashboard
            </Link>
          )}

          {userRole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
