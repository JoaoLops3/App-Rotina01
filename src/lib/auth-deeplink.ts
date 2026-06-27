import { getSupabase } from "./supabase";

/** Processa deep links de confirmação de e-mail / recovery no Capacitor. */
export async function handleAuthDeepLink(url: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get("code");

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      return;
    }

    const hash = parsed.hash.startsWith("#")
      ? parsed.hash.slice(1)
      : parsed.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  } catch {
    // Link inválido ou expirado — auth state permanece inalterado.
  }
}
