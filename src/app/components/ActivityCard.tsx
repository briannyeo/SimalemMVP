import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Leaf, Users } from "lucide-react";
import type { Activity } from "../../types";

interface ActivityCardProps {
  activity: Activity;
  onBook: (activity: Activity) => void;
  hideBookButton?: boolean;
}

const communityImpactDescriptions: Record<string, string> = {
  "Direct Local Partner":
    "This activity is operated in partnership with external local guides, farmers, or artisans. Revenue contributes directly to community-based stakeholders.",
  "Internal Community Support":
    "This activity is delivered by Simalem staff and supports internal employment, fair wages, and community uplift within the resort ecosystem.",
  "No Direct Community Link":
    "This activity does not involve a specific local partner or targeted community program beyond standard resort operations.",
};

const environmentalImpactDescriptions: Record<string, string> = {
  Low:
    "This activity involves minimal resource consumption and no motorised transport. It has limited environmental disturbance relative to other offerings.",
  Medium:
    "This activity involves moderate resource use or managed transport. Environmental impact is controlled but higher than non-motorised alternatives.",
  High:
    "This activity involves motorised transport or higher energy consumption, resulting in greater environmental intensity relative to other resort activities.",
};

export function ActivityCard({
  activity,
  onBook,
  hideBookButton = false,
}: ActivityCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(event) => {
            const target = event.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop";
          }}
        />
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{activity.name}</CardTitle>
            <CardDescription className="mt-1">
              {activity.duration} • ${activity.price}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {activity.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{activity.description}</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 flex-shrink-0">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500">Community</div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm font-semibold text-blue-600 cursor-help underline decoration-dotted">
                    {activity.communityImpact}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-900 text-white">
                  {communityImpactDescriptions[activity.communityImpact] ||
                    "No description available."}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 flex-shrink-0">
              <Leaf className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500">
                Environmental
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm font-semibold text-emerald-600 cursor-help underline decoration-dotted">
                    {activity.environmentalImpact}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-900 text-white">
                  {environmentalImpactDescriptions[activity.environmentalImpact] ||
                    "No description available."}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>

      {!hideBookButton && (
        <CardFooter>
          <Button
            onClick={() => onBook(activity)}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Book Activity
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
