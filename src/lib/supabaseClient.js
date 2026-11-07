import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "https://rxaxptszsytnanfixfst.supabase.co";
const supabaseUrl = rawUrl.replace(/['"]/g, "").replace(/\/rest\/v1\/?$/, "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4YXhwdHN6c3l0bmFuZml4ZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDg5MzYsImV4cCI6MjA4Nzk4NDkzNn0.8SI6VvZ5Kr_ZsYahb9KEa2Y08m_YhjPxZTgZki_zq9M").replace(/['"]/g, "").trim();

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseAnonKey.includes("tu-clave")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
