import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { mapAuthError } from "./auth-errors";
import { getAuthRedirectPath } from "./app-url";
import { loadProfile, saveProfile } from "./profile-storage";
import { clearAllLocalAppData } from "./user-data-export";
import { captureEvent, identifyUser, resetAnalyticsUser } from "./posthog";
import { getSupabase, isSupabaseConfigured } from "./supabase";

interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
}

function getDisplayNameFromUser(user: User): string | null {
  const raw = user.user_metadata?.display_name;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function ensureProfileRow(user: User): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const metaName = getDisplayNameFromUser(user);

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        ...(metaName ? { display_name: metaName } : {}),
      },
      { onConflict: "id" },
    );
    if (metaName) {
      saveProfile({ ...loadProfile(), displayName: metaName });
    }
    return;
  }

  if (metaName && existing.display_name === "Alex") {
    await supabase
      .from("profiles")
      .update({ display_name: metaName })
      .eq("id", user.id);
    saveProfile({ ...loadProfile(), displayName: metaName });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        void ensureProfileRow(data.session.user);
        identifyUser(data.session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === "SIGNED_IN" && nextSession?.user) {
        void ensureProfileRow(nextSession.user);
        identifyUser(nextSession.user.id);
        captureEvent("auth signed in");
      }

      if (event === "SIGNED_OUT") {
        resetAnalyticsUser();
        captureEvent("auth signed out");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const supabase = getSupabase();
      if (!supabase) {
        return { error: "Conta na nuvem não configurada neste ambiente." };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      return { error: mapAuthError(error) };
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
    ): Promise<AuthResult> => {
      const supabase = getSupabase();
      if (!supabase) {
        return {
          error: "Conta na nuvem não configurada neste ambiente.",
          needsEmailConfirmation: false,
        };
      }

      const trimmedName = displayName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: getAuthRedirectPath("/login"),
          data: { display_name: trimmedName },
        },
      });

      if (error) {
        return { error: mapAuthError(error), needsEmailConfirmation: false };
      }

      const needsEmailConfirmation = !data.session && Boolean(data.user);
      if (data.session?.user) {
        await ensureProfileRow(data.session.user);
        saveProfile({ ...loadProfile(), displayName: trimmedName });
        captureEvent("auth signed up");
      } else if (needsEmailConfirmation) {
        captureEvent("auth signed up", { pending_email_confirmation: true });
      }

      return { error: null, needsEmailConfirmation };
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: "Conta na nuvem não configurada neste ambiente." };
    }

    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      return {
        error:
          error.message.includes("Not authenticated")
            ? "Sessão expirada. Faça login novamente."
            : "Não foi possível excluir a conta. Tente novamente.",
      };
    }

    clearAllLocalAppData();
    await supabase.auth.signOut();
    captureEvent("auth account deleted");
    return { error: null };
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<AuthResult> => {
      const supabase = getSupabase();
      if (!supabase) {
        return { error: "Conta na nuvem não configurada neste ambiente." };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getAuthRedirectPath("/login"),
      });

      return { error: mapAuthError(error) };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: Boolean(user),
      authConfigured: isSupabaseConfigured(),
      signIn,
      signUp,
      signOut,
      deleteAccount,
      resetPassword,
    }),
    [user, session, isLoading, signIn, signUp, signOut, deleteAccount, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AUTH_ROUTE_PREFIXES = ["/login", "/cadastro", "/recuperar-senha"];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
