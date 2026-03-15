/**
 * Utility functions for formatting data
 */

/**
 * Convert duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "2 hours", "2.5 hours")
 */
export function formatDuration(minutes: number): string {
  const hours = minutes / 60;
  
  if (hours === Math.floor(hours)) {
    // Whole hours (e.g., 2 hours, 3 hours)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    // Fractional hours (e.g., 2.5 hours, 3.5 hours)
    return `${hours} hours`;
  }
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
