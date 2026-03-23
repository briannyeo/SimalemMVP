import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, Hotel } from 'lucide-react';
import { fetchGuestBookings } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useGuestStay } from '../context/GuestStayContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { GuestBooking } from '../../types';

function normalizeDate(date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isActiveGuestBooking(guestBooking: GuestBooking) {
  const checkoutDate = normalizeDate(new Date(`${guestBooking.checkoutDate}T00:00:00`));
  const today = normalizeDate(new Date());
  return checkoutDate >= today;
}

function getNextRoomNumber(guestBookings: GuestBooking[]) {
  const highestAssignedRoom = guestBookings.reduce((highestRoom, guestBooking) => {
    const parsedRoomNumber = Number.parseInt(guestBooking.roomNumber, 10);

    if (Number.isNaN(parsedRoomNumber)) {
      return highestRoom;
    }

    return Math.max(highestRoom, parsedRoomNumber);
  }, 202);

  return String(highestAssignedRoom + 1);
}

export function GuestStayForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, userRole } = useAuth();
  const { profile, restoreProfile, saveProfile } = useGuestStay();
  const { clearBookings, replaceBookings } = useBooking();
  const [guestName, setGuestName] = useState(profile.guestName);
  const [checkInDate, setCheckInDate] = useState(profile.checkInDate ?? '');
  const [checkOutDate, setCheckOutDate] = useState(profile.checkOutDate ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLookingUpGuest, setIsLookingUpGuest] = useState(false);

  const returnTo = useMemo(
    () => searchParams.get('returnTo') || '/activities',
    [searchParams],
  );
  const today = useMemo(() => formatDateInputValue(new Date()), []);

  const handleContinue = async () => {
    const trimmedName = guestName.trim();

    if (!trimmedName || !checkInDate || !checkOutDate) {
      setErrorMessage('Please complete your name, check-in date, and check-out date.');
      return;
    }

    if (checkInDate < today) {
      setErrorMessage('Check-in date cannot be before today.');
      return;
    }

    if (new Date(`${checkOutDate}T00:00:00`) <= new Date(`${checkInDate}T00:00:00`)) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }

    try {
      setIsLookingUpGuest(true);
      const guestBookings = await fetchGuestBookings();
      const existingGuestBooking = guestBookings.find(
        (guestBooking) =>
          guestBooking.guestName.trim().toLowerCase() === trimmedName.toLowerCase() &&
          isActiveGuestBooking(guestBooking),
      );

      if (existingGuestBooking) {
        restoreProfile({
          guestId: existingGuestBooking.guestId,
          guestName: existingGuestBooking.guestName,
          checkInDate: existingGuestBooking.checkInDate,
          checkOutDate: existingGuestBooking.checkoutDate,
          roomNumber: existingGuestBooking.roomNumber,
          updatedAt: existingGuestBooking.updatedAt ?? new Date().toISOString(),
        });
        replaceBookings(existingGuestBooking.activities);
      } else {
        clearBookings();
        saveProfile({
          guestName: trimmedName,
          checkInDate,
          checkOutDate,
          roomNumber: getNextRoomNumber(guestBookings),
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'We could not look up guest bookings right now.';
      setErrorMessage(message);
      return;
    } finally {
      setIsLookingUpGuest(false);
    }

    if (userRole !== 'guest') {
      login('guest');
    }

    const nextPath = new URLSearchParams({ returnTo }).toString();
    navigate(`/guest-interests?${nextPath}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(userRole === 'guest' ? '/activities' : '/')}
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700"
        >
          <ChevronLeft className="h-4 w-4" />
          {userRole === 'guest' ? 'Back to activities' : 'Back to sign in'}
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-0 bg-white/90 shadow-xl shadow-sky-100/70">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                  <Hotel className="h-6 w-6 text-sky-700" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Tell us about your stay</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-base text-gray-600">
                    We use your stay dates to prepare checkout charges for your room,
                    lunch, and dinner automatically for each day you are with us.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="guest-name">Guest name</Label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(event) => {
                    setGuestName(event.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check-in-date">Check-in date</Label>
                  <Input
                    id="check-in-date"
                    type="date"
                    value={checkInDate}
                    min={today}
                    onChange={(event) => {
                      setCheckInDate(event.target.value);
                      setErrorMessage('');
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out-date">Check-out date</Label>
                  <Input
                    id="check-out-date"
                    type="date"
                    value={checkOutDate}
                    min={checkInDate || today}
                    onChange={(event) => {
                      setCheckOutDate(event.target.value);
                      setErrorMessage('');
                    }}
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLookingUpGuest}
                >
                  {isLookingUpGuest ? 'Checking guest booking...' : 'Continue to guest interests'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/guest-interests?${new URLSearchParams({ returnTo }).toString()}`)}
                  disabled={isLookingUpGuest}
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
