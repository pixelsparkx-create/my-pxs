import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export type GoogleSignInResult = {
  error?: { message?: string } | Error | null;
  redirected?: boolean;
};

/**
 * Google sign-in that works both inside Lovable and on a standalone deployment.
 *
 * - Default (VITE_AUTH_MODE unset or "lovable"): uses the Lovable OAuth broker,
 *   which is the only flow that works inside the Lovable editor preview.
 * - VITE_AUTH_MODE=supabase: uses standard Supabase OAuth against your own
 *   Supabase project. Set this on your own hosting (Vercel/Netlify/Cloudflare).
 */
export async function signInWithGoogle(redirectTo: string): Promise<GoogleSignInResult> {
  const mode = import.meta.env["VITE_AUTH_MODE"] ?? "lovable";

  if (mode === "supabase") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) return { error };
    // Supabase performs a full-page redirect to Google.
    return { redirected: true };
  }

  return (await lovable.auth.signInWithOAuth("google", {
    redirect_uri: redirectTo,
  })) as GoogleSignInResult;
}
