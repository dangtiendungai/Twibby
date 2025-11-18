-- Fix RLS Policy for Profile Updates
-- This script updates the existing UPDATE policy to include WITH CHECK clause
-- Run this in your Supabase SQL Editor if you're getting "new row violates row-level security policy" errors

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create the updated policy with both USING and WITH CHECK clauses
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

