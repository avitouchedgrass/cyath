'use client';

import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabitStore } from '@/store/useHabitStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUserSession } = useHabitStore();

  useEffect(() => {
    // 1. Check initial Supabase session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserSession({
            id: session.user.id,
            email: session.user.email,
          });
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      }
    };

    initSession();

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setUserSession({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        // Only clear if not in an explicit demo/guest session
        const current = useHabitStore.getState().userSession;
        if (current && !current.id.startsWith('guest_')) {
          setUserSession(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUserSession]);

  return <>{children}</>;
}
