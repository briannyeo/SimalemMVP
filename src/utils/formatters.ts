/**
 * Utility functions for formatting data
 */

/**
 * Convert duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "1 hour 30 mins")
 */
export function formatDuration(minutes: number): string {
  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} mins`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} mins`;
}

export function formatDurationDisplay(duration: string | number): string {
  if (typeof duration === 'number' && Number.isFinite(duration)) {
    return formatDuration(duration);
  }

  const trimmedDuration = duration.trim();
  const minutesMatch = trimmedDuration.match(
    /^(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes)$/i,
  );

  if (minutesMatch) {
    return formatDuration(Number(minutesMatch[1]));
  }

  const hoursMatch = trimmedDuration.match(
    /^(\d+(?:\.\d+)?)\s*(hour|hours)$/i,
  );

  if (hoursMatch) {
    return formatDuration(Number(hoursMatch[1]) * 60);
  }

  if (/^\d+(?:\.\d+)?$/.test(trimmedDuration)) {
    return formatDuration(Number(trimmedDuration));
  }

  return trimmedDuration;
}

/**
 * Format a price to currency string
 * @param price - Price in dollars
 * @returns Formatted price string (e.g., "$45.00")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Feb 20, 2026")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculate Purpose Engagement Ratio (PER)
 * @param communityRatio - Community impact ratio (0-1)
 * @param environmentalRatio - Environmental impact ratio (0-1)
 * @returns Combined PER score (0-1)
 */
export function calculatePER(communityRatio: number, environmentalRatio: number): number {
  return (communityRatio + environmentalRatio) / 2;
}

/**
 * Get badge variant for community impact
 */
export function getCommunityImpactVariant(impact: string): 'default' | 'secondary' | 'outline' {
  switch (impact) {
    case 'Direct Local Partner':
      return 'default';
    case 'Internal Community Support':
      return 'secondary';
    case 'No Direct Community Link':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Get badge variant for environmental impact
 */
export function getEnvironmentalImpactVariant(impact: string): 'default' | 'secondary' | 'outline' {
  switch (impact) {
    case 'Low':
      return 'default';
    case 'Medium':
      return 'secondary';
    case 'High':
      return 'outline';
    default:
      return 'outline';
  }
}
