import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, Compass, Mountain, Sparkles } from 'lucide-react';
import { generateGuestItinerary } from '../../services/api';
import { useAiItinerary } from '../context/AiItineraryContext';
import { useAuth } from '../context/AuthContext';
import {
  guestInterestOptions,
  useGuestInterest,
} from '../context/GuestInterestContext';
import type { GuestInterestKey } from '../../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';

export function GuestInterestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userRole, login } = useAuth();
  const { profile, saveProfile, clearProfile, hasInterests } = useGuestInterest();
  const { setItinerary, clearItinerary } = useAiItinerary();
  const [selectedInterests, setSelectedInterests] = useState<GuestInterestKey[]>(
    profile.selectedInterests,
  );
  const [notes, setNotes] = useState(profile.notes);
  const [isGenerating, setIsGenerating] = useState(false);

  const returnTo = useMemo(
    () => searchParams.get('returnTo') || '/activities',
    [searchParams],
  );

  const canSubmit =
    selectedInterests.length > 0 || notes.trim().length > 0;

  const toggleInterest = (interest: GuestInterestKey, checked: boolean) => {
    setSelectedInterests((current) => {
      if (checked) {
        return current.includes(interest) ? current : [...current, interest];
      }

      return current.filter((item) => item !== interest);
    });
  };

  const handleContinue = async () => {
    const nextProfile = {
      selectedInterests,
      notes: notes.trim(),
    };

    saveProfile(nextProfile);
    clearItinerary();

    if (userRole !== 'guest') {
      login('guest');
    }

    try {
      setIsGenerating(true);
      const itinerary = await generateGuestItinerary({
        ...nextProfile,
        updatedAt: new Date().toISOString(),
      });
      setItinerary(itinerary);
      navigate(returnTo);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'We could not generate an AI itinerary right now.';

      navigate(returnTo, {
        state: {
          aiGenerationError: errorMessage,
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkip = () => {
    if (userRole !== 'guest') {
      login('guest');
    }

    clearItinerary();
    navigate(returnTo);
  };

  const handleClear = () => {
    clearProfile();
    setSelectedInterests([]);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(userRole === 'guest' ? returnTo : '/')}
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700"
        >
          <ChevronLeft className="h-4 w-4" />
          {userRole === 'guest' ? 'Back to activities' : 'Back to sign in'}
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-0 bg-white/90 shadow-xl shadow-emerald-100/60">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <Mountain className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                    Guest profile
                  </Badge>
                  <CardTitle className="mt-3 text-3xl">
                    What would you like to explore?
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="max-w-2xl text-base text-gray-600">
                Tell us what you are interested in and we will surface the most
                relevant resort experiences first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {guestInterestOptions.map((option) => {
                  const checked = selectedInterests.includes(option.id);

                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                        checked
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleInterest(option.id, value === true)
                        }
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <Label className="cursor-pointer text-sm font-semibold text-gray-900">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-interest-notes">
                  Anything specific you want us to keep in mind?
                </Label>
                <Textarea
                  id="guest-interest-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Example: I prefer quiet morning activities, family-friendly options, or local food experiences."
                  className="min-h-28 bg-white"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleContinue}
                  disabled={!canSubmit || isGenerating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  {isGenerating ? 'Generating AI itinerary...' : 'Continue to activities'}
                </Button>
                {/* <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  disabled={isGenerating}
                >
                  Skip for now
                </Button> */}
                {hasInterests && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handleClear}
                    disabled={isGenerating}
                  >
                    Clear selections
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* <div className="grid gap-6">
            <Card className="border-0 bg-gray-900 text-white shadow-xl shadow-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                  How this helps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-200">
                <div className="rounded-2xl bg-white/10 p-4">
                  We will highlight activities that match your interests before
                  you start booking.
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  Your preferences stay on this device, so you can update them
                  anytime during your visit.
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                  <Compass className="h-5 w-5 text-sky-600" />
                  Suggested interests
                </CardTitle>
                <CardDescription>
                  Guests usually pick two or three so recommendations stay broad.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {guestInterestOptions.map((option) => (
                  <Badge key={option.id} variant="secondary" className="rounded-full px-3 py-1">
                    {option.label}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </div>
  );
}
