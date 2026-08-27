-- Cyath Supabase Database Schema
-- Run this script inside the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  age INTEGER,
  sex TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  primary_goal TEXT,
  allergies TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  streak_count INTEGER DEFAULT 0 NOT NULL,
  streak_freeze_stock INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 2. Create Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  target_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habits" 
  ON public.habits FOR ALL 
  USING (auth.uid() = user_id);

-- 3. Create Daily Logs Table (Routines, Nutrition, Energy, Mood, Recipes)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  habits_completed JSONB DEFAULT '{}'::jsonb,
  total_protein NUMERIC DEFAULT 0,
  total_calories NUMERIC DEFAULT 0,
  hydration_liters NUMERIC DEFAULT 0,
  sleep_hours NUMERIC DEFAULT 7.5,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  notes TEXT DEFAULT '',
  logged_recipes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own daily logs" 
  ON public.daily_logs FOR ALL 
  USING (auth.uid() = user_id);

-- 4. Drop Scrapped Cabin States Table
DROP TABLE IF EXISTS public.cabin_states CASCADE;

-- 5. Create XP Events Table (Progression Audit Trail)
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT DEFAULT 'app',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp events" 
  ON public.xp_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp events" 
  ON public.xp_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own xp events" 
  ON public.xp_events FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. Trigger to automatically initialize profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, total_xp, streak_count, streak_freeze_stock)
  VALUES (new.id, split_part(new.email, '@', 1), 0, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
