import { createClient } from "@supabase/supabase-js";

// Client-side singleton (safe for browser — env vars are NEXT_PUBLIC_*)
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

// Server-side admin client using service role key (never exposed to browser)
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Convenience export for client components
export const supabase = {
  auth: {
    signInWithOtp: (...args: Parameters<ReturnType<typeof createClient>["auth"]["signInWithOtp"]>) =>
      getSupabaseClient().auth.signInWithOtp(...args),
    getSession: () => getSupabaseClient().auth.getSession(),
    signOut: () => getSupabaseClient().auth.signOut(),
  },
  from: (table: string) => getSupabaseClient().from(table),
};
