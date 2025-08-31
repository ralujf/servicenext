import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton pattern to ensure only one Supabase client instance
let _supabaseClient: any = null;

// Create a single Supabase client instance to be shared across the application
// This prevents multiple GoTrueClient instances from being created
const getSupabaseClient = () => {
  if (!_supabaseClient) {
    // Clear any existing auth storage to prevent conflicts
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-' + projectId + '-auth-token');
    } catch (e) {
      // Ignore localStorage errors
    }

    console.log('[ServiceNext] Creating shared Supabase client instance');
    _supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: `sb-${projectId}-auth-token`,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        }
      }
    );
    
    // Add a marker to help identify this instance
    _supabaseClient.__servicenext_instance = true;
  }
  return _supabaseClient;
};

export const supabaseClient = getSupabaseClient();

// Export a function to get the current session
export const getCurrentSession = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
};

// Export a function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
};

// Export a function to get access token with retry logic
export const getAccessToken = async (retries = 3): Promise<string | null> => {
  try {
    // First try to get the current session
    let session = await getCurrentSession();
    
    // If no session, try refreshing the session
    if (!session && retries > 0) {
      console.log('[ServiceNext] No session found, attempting to refresh...');
      const { data: { session: refreshedSession }, error } = await supabaseClient.auth.refreshSession();
      
      if (error) {
        console.error('[ServiceNext] Session refresh failed:', error);
        return null;
      }
      
      session = refreshedSession;
    }
    
    // If still no session after refresh, return null
    if (!session) {
      console.warn('[ServiceNext] No valid session available');
      return null;
    }
    
    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('[ServiceNext] Session expired, attempting to refresh...');
      
      if (retries > 0) {
        const { data: { session: newSession }, error } = await supabaseClient.auth.refreshSession();
        
        if (error) {
          console.error('[ServiceNext] Session refresh failed:', error);
          return null;
        }
        
        session = newSession;
      }
    }
    
    const token = session?.access_token;
    if (!token) {
      console.warn('[ServiceNext] No access token in session');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('[ServiceNext] Error getting access token:', error);
    
    // Retry with exponential backoff
    if (retries > 0) {
      console.log(`[ServiceNext] Retrying getAccessToken... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // 1s, 2s, 3s delays
      return getAccessToken(retries - 1);
    }
    
    return null;
  }
};

// Export a function to cleanup and reinitialize auth (if needed for debugging)
export const cleanupAuthState = () => {
  try {
    // Clear localStorage auth tokens
    const storageKeys = Object.keys(localStorage);
    storageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth-token') || key.includes(projectId)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[ServiceNext] Auth state cleaned up');
    
    // Force page reload to reinitialize with clean state
    window.location.reload();
  } catch (error) {
    console.error('[ServiceNext] Error cleaning up auth state:', error);
  }
};