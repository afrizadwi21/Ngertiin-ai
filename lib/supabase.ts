import { createBrowserClient } from "@supabase/ssr";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hpfycktwrujifyddslkl.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZnlja3R3cnVqaWZ5ZGRzbGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTY5MTgsImV4cCI6MjA5NDU5MjkxOH0.QxHfngIO_hbHMKCJ4Tkqp74XjybVl07lkngre__Cums";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);