import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Activity } from "../context/BookingContext";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { formatDurationDisplay } from "../../utils/formatters";
import { useGuestStay } from "../context/GuestStayContext";

interface BookingModalProps {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (activity: Activity, date: Date, time: string) => void;
}

const timeSlots = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export function BookingModal({
  activity,
  open,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const { profile, hasStayDetails } = useGuestStay();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleConfirm = () => {
    if (activity && selectedDate && selectedTime) {
      onConfirm(activity, selectedDate, selectedTime);
      // Reset selections
      setSelectedDate(undefined);
      setSelectedTime("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    onClose();
  };

  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = profile.checkInDate
    ? new Date(`${profile.checkInDate}T00:00:00`)
    : undefined;
  const checkOutDate = profile.checkOutDate
    ? new Date(`${profile.checkOutDate}T00:00:00`)
    : undefined;

  const firstBookableDate =
    checkInDate && checkInDate > today ? checkInDate : today;

  const lastBookableDate = checkOutDate
    ? new Date(checkOutDate.getTime() - 86400000)
    : undefined;

  const isDateDisabled = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    if (normalizedDate < today) {
      return true;
    }

    if (!hasStayDetails || !checkInDate || !checkOutDate) {
      return true;
    }

    return normalizedDate < checkInDate || normalizedDate >= checkOutDate;
  };

  const bookingWindowLabel =
    hasStayDetails && checkInDate && checkOutDate
      ? `${firstBookableDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} to ${lastBookableDate && lastBookableDate >= firstBookableDate
          ? lastBookableDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : firstBookableDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`
      : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Book {activity?.name}
          </DialogTitle>
          <DialogDescription>
            Select your preferred date and time for this activity
          </DialogDescription>
        </DialogHeader>

        {!hasStayDetails ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Add your stay dates first before booking activities. Only dates during
            your hotel stay can be selected.
          </div>
        ) : bookingWindowLabel ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
            Bookable dates for this stay: {bookingWindowLabel}
          </div>
        ) : null}

        <div className="grid gap-6 py-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          {/* Date Selection */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">Select Date</h3>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">Select Time</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm transition-all sm:px-4 ${
                    selectedTime === time
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Details */}
        {(selectedDate || selectedTime) && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-900 mb-2">
              Your Selection:
            </h4>
            <div className="text-sm text-emerald-700 space-y-1">
              {selectedDate && (
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              {selectedTime && (
                <p>
                  <strong>Time:</strong> {selectedTime}
                </p>
              )}
              {activity && (
                <p>
                  <strong>Duration:</strong> {formatDurationDisplay(activity.duration)}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || !hasStayDetails}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
