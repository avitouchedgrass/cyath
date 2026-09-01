'use client';

import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useHabitStore } from '@/store/useHabitStore';
import { formatLocalDate } from '@/lib/dateUtils';

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
        } else {
          // If no authenticated Supabase session, purge custom recipes and reset logs for guest
          const current = useHabitStore.getState().userSession;
          if (current && !current.id.startsWith('guest_')) {
            setUserSession(null);
          } else {
            useHabitStore.setState({
              userSession: null,
              userProfile: null,
              customRecipes: [],
              logsByDate: { [formatLocalDate()]: {
                habitsCompleted: {},
                totalProteinLogged: 0,
                totalCaloriesLogged: 0,
                hydrationLiters: 0,
                sleepHours: 8,
                energyLevel: 7,
                moodScore: 7,
                notes: '',
                loggedRecipeIds: [],
              } },
              streakCount: 0,
              pendingAction: null,
            });
          }
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
        // Only clear if not in an active in-memory guest session
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
