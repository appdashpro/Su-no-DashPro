import { createClient } from '@supabase/supabase-js';

// Sanitize URL in case user accidentally added /rest/v1 or trailing slashes in the env var
let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co').trim();
try {
  const urlObj = new URL(supabaseUrl);
  supabaseUrl = `${urlObj.protocol}//${urlObj.host}`;
} catch (e) {
  // Ignore if invalid URL
}

const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key').trim();

const customFetch = async (...args: any[]) => {
  try {
    return await fetch(...(args as [RequestInfo, RequestInit?]));
  } catch (error: any) {
    console.warn('Network request dropped (handled by offline mode):', args[0]);
    // Treat any error during fetch as an offline/network error to avoid throwing objects that crash the app
    return new Response(JSON.stringify({ error: 'offline', message: 'Failed to fetch', details: error.toString() }), {
      status: 502,
      statusText: 'Bad Gateway',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

const customStorage = {
  getItem: (key: string) => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch
  },
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
