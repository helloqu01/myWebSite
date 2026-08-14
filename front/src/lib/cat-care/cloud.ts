import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  || "";

let client: SupabaseClient | null = null;

export function isCloudConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey && !supabaseUrl.includes("your-project"));
}

export function getCloudClient(): SupabaseClient | null {
  if (!isCloudConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
