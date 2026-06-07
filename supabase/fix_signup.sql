-- Run this in Supabase SQL Editor to fix signup issues
-- This changes the plan_tier default from 'free' to 'solo'

ALTER TABLE public.profiles ALTER COLUMN plan_tier SET DEFAULT 'solo';
