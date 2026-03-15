import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Mountain, LogOut } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function Header() {
  const { bookedActivities } = useBooking();
  const { userRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link
          to={
            userRole === "supervisor" ? "/admin" : "/activities"
          }
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Mountain className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-semibold">
            Simalem Resort
          </span>
        </Link>

        <nav className="flex items-center gap-6">
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
                  <span>Final Checkout</span>
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