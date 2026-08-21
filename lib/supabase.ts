import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Reads the service-role key so it can run
 * database writes from Next.js API routes / server components. Never import
 * this in a client component — it exposes the service-role key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase configuration: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
