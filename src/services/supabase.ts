/**
 * Supabase client configuration and initialization
 * 
 * This file provides centralized helper functions for Supabase access.
 * Works in both Figma Make and local development environments.
 * 
 * Priority:
 * 1. Environment variables (.env file) - Local development
 * 2. Figma Make info file - Figma Make environment
 * 3. Error if neither available
 */

// Lazy-loaded Figma config - only imported if needed
let figmaConfigCache: { projectId: string; publicAnonKey: string } | null | undefined = undefined;

/**
 * Attempt to load Figma Make configuration
 * Returns null if file doesn't exist (local dev without .env)
 */
async function getFigmaConfig(): Promise<{ projectId: string; publicAnonKey: string } | null> {
  // Return cached result if already loaded
  if (figmaConfigCache !== undefined) {
    return figmaConfigCache;
  }

  try {
    // Try to dynamically import the Figma Make info file
    // This file only exists in Figma Make environment
    const module = await import('/utils/supabase/info.tsx');
    figmaConfigCache = {
      projectId: module.projectId,
      publicAnonKey: module.publicAnonKey,
    };
    return figmaConfigCache;
  } catch (e) {
    // File doesn't exist - we're in local dev mode
    figmaConfigCache = null;
    return null;
  }
}

/**
 * Get the Supabase URL
 * Tries environment variables first, then falls back to Figma Make config
 */
export async function getSupabaseUrl(): Promise<string> {
  // Try environment variable first (local development)
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback to Figma Make hardcoded credentials
  const figmaConfig = await getFigmaConfig();
  if (figmaConfig?.projectId) {
    return `https://${figmaConfig.projectId}.supabase.co`;
  }
  
  throw new Error(
    'Supabase URL not configured. For local development, create a .env file with VITE_SUPABASE_URL. See .env.example for template.'
  );
}

/**
 * Get the Supabase anon key
 * Tries environment variables first, then falls back to Figma Make config
 */
export async function getSupabaseAnonKey(): Promise<string> {
  // Try environment variable first (local development)
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey) {
    return envKey;
  }
  
  // Fallback to Figma Make hardcoded credentials
  const figmaConfig = await getFigmaConfig();
  if (figmaConfig?.publicAnonKey) {
    return figmaConfig.publicAnonKey;
  }
  
  throw new Error(
    'Supabase anon key not configured. For local development, create a .env file with VITE_SUPABASE_ANON_KEY. See .env.example for template.'
  );
}

/**
 * Helper function to get the server URL for edge functions
 */
export async function getServerUrl(): Promise<string> {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  if (serverUrl) {
    return serverUrl;
  }
  
  // Fallback: construct from Supabase URL
  const url = await getSupabaseUrl();
  const projectId = url.split('//')[1]?.split('.')[0];
  return `https://${projectId}.supabase.co/functions/v1`;
}

/**
 * Helper function to get authorization headers for edge function calls
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const anonKey = await getSupabaseAnonKey();
  return {
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}
