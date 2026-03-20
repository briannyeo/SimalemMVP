import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useBooking } from '../context/BookingContext';
import { ActivityCard } from '../components/ActivityCard';
import type { Activity } from '../../types';

export function Summary() {
  const { bookedActivities, removeActivity } = useBooking();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDayView, setIsDayView] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getActivityForDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return bookedActivities.find((activity) => {
      if (!activity.bookingDate) return false;
      const activityDate = new Date(activity.bookingDate);
      return (
        activityDate.getDate() === day &&
        activityDate.getMonth() === month &&
        activityDate.getFullYear() === year
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleActivityHover = (
    activity: Activity | null,
    event?: React.MouseEvent,
  ) => {
    if (!isDayView) {
      setHoveredActivity(activity);
      if (event && activity) {
        setHoverPosition({ x: event.clientX, y: event.clientY });
      }
    }
  };

  const closeActivityPopup = () => {
    setSelectedActivity(null);
  };

  const handleCancelBooking = (activityId: string) => {
    removeActivity(activityId);
    setSelectedActivity(null);
    setIsDayView(false);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsDayView(true);
  };

  const handleBackToMonthView = () => {
    setIsDayView(false);
    setSelectedDay(null);
  };

  const getActivityForTimeSlot = (day: number, hour: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return bookedActivities.find((activity) => {
      if (!activity.bookingDate || !activity.bookingTime) return false;
      const activityDate = new Date(activity.bookingDate);

      if (
        activityDate.getDate() !== day ||
        activityDate.getMonth() !== month ||
        activityDate.getFullYear() !== year
      ) {
        return false;
      }

      const timeMatch = activity.bookingTime.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (!timeMatch) return false;

      let activityHour = parseInt(timeMatch[1]);
      const period = timeMatch[3];

      if (period === 'PM' && activityHour !== 12) {
        activityHour += 12;
      } else if (period === 'AM' && activityHour === 12) {
        activityHour = 0;
      }

      return activityHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Activity Calendar
          </h1>
          <p className="text-gray-600">View and manage your booked activities</p>
        </div>

        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthName}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const activity = getActivityForDate(day);
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 transition-all cursor-pointer ${
                      isToday
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onMouseEnter={(event) =>
                      activity && handleActivityHover(activity, event)
                    }
                    onMouseLeave={() => handleActivityHover(null)}
                    onMouseMove={(event) =>
                      activity &&
                      setHoverPosition({ x: event.clientX, y: event.clientY })
                    }
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-sm font-medium ${
                          isToday ? 'text-emerald-700' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                      {activity && (
                        <div className="mt-1 flex-1 min-h-0">
                          <div className="text-xs bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 truncate font-medium">
                            {activity.bookingTime}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-tight">
                            {activity.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 bg-emerald-50 rounded" />
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-100 rounded" />
                  <span className="text-gray-600">Booked Activity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {bookedActivities.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Activities</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Community Impact
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Direct Local Partner:</span>
                    <span className="font-semibold text-blue-600">
                      {
                        bookedActivities.filter(
                          (activity) =>
                            activity.communityImpact === 'Direct Local Partner',
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Internal Support:</span>
                    <span className="font-semibold text-blue-600">
                      {
                        bookedActivities.filter(
                          (activity) =>
                            activity.communityImpact === 'Internal Community Support',
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No Direct Link:</span>
                    <span className="font-semibold text-blue-600">
                      {
                        bookedActivities.filter(
                          (activity) =>
                            activity.communityImpact === 'No Direct Community Link',
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Environmental Impact
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">High:</span>
                    <span className="font-semibold text-emerald-600">
                      {
                        bookedActivities.filter(
                          (activity) => activity.environmentalImpact === 'High',
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medium:</span>
                    <span className="font-semibold text-emerald-600">
                      {
                        bookedActivities.filter(
                          (activity) => activity.environmentalImpact === 'Medium',
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low:</span>
                    <span className="font-semibold text-emerald-600">
                      {
                        bookedActivities.filter(
                          (activity) => activity.environmentalImpact === 'Low',
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {hoveredActivity && !selectedActivity && !isDayView && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${hoverPosition.x + 20}px`,
            top: `${hoverPosition.y - 100}px`,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 pointer-events-none">
            <ActivityCard
              activity={hoveredActivity}
              onBook={() => {}}
              hideBookButton
            />
          </div>
        </div>
      )}

      {selectedActivity && !isDayView && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeActivityPopup}
        >
          <div
            className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-w-full relative"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={closeActivityPopup}
            >
              <X className="h-4 w-4" />
            </Button>

            <ActivityCard
              activity={selectedActivity}
              onBook={() => {}}
              hideBookButton
            />

            <div className="px-6 pb-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time
                </div>
                {selectedActivity.bookingDate && (
                  <div className="text-base font-semibold text-gray-900">
                    {new Date(selectedActivity.bookingDate).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">
                  {selectedActivity.bookingTime}
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleCancelBooking(selectedActivity.id)}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDayView && selectedDay && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={handleBackToMonthView}
        >
          <div
            className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleBackToMonthView}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-emerald-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      selectedDay,
                    ).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h2>
                  <p className="text-sm text-gray-600">Daily Schedule</p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-100px)] px-6 py-4">
              <div className="space-y-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const activity = getActivityForTimeSlot(selectedDay, hour);

                  return (
                    <div
                      key={hour}
                      className={`flex gap-4 p-3 rounded-lg border transition-colors ${
                        activity
                          ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="w-24 flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-700">
                          {formatHour(hour)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {activity ? (
                          <div className="space-y-2">
                            <div>
                              <div className="font-semibold text-gray-900 mb-1">
                                {activity.name}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {activity.description}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Time: {activity.duration}</span>
                                <span>Price: ${activity.price}</span>
                                <span>Community: {activity.communityImpact}</span>
                                <span>
                                  Environment: {activity.environmentalImpact}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleCancelBooking(activity.id)}
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            No activity scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
