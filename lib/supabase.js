'use client';

// Use the main Supabase client in browser components
import { createClient as createSb } from '@supabase/supabase-js';

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createSb(url, anon);
};
