import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient.js';

export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoadingSession(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      console.log('[useAuthSession] Loaded auth session:', Boolean(data.session));
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log('[useAuthSession] Auth state changed:', event);
      setSession(nextSession);
      setIsLoadingSession(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    isLoadingSession,
    isSignedIn: Boolean(session?.user)
  };
}
