import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project-id.supabase.co" && 
  supabaseAnonKey !== "your-anon-public-key";

if (!isConfigured && typeof window !== "undefined") {
  console.warn("⚠️ Supabase credentials are not configured in .env.local. Operating in LocalStorage mode.");
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
