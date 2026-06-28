import { useCallback, useState } from "react";
import type { UseUpdateNicknameResult } from "../types/avatar";
import { validateNickname } from "../lib/auth-errors";
import { useProfile } from "../lib/profile-context";
import { useAuth } from "../lib/auth-context";
import { captureEvent } from "../lib/posthog";

export function useUpdateNickname(): UseUpdateNicknameResult {
  const { profile, setProfile } = useProfile();
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNickname = useCallback(
    async (nickname: string) => {
      const validationError = validateNickname(nickname);
      if (validationError) {
        setError(validationError);
        throw new Error(validationError);
      }

      setIsSaving(true);
      setError(null);
      try {
        const trimmed = nickname.trim();
        setProfile({ ...profile, nickname: trimmed });
        captureEvent("nickname updated", {
          synced_to_cloud: isAuthenticated,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Não foi possível salvar.",
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [profile, setProfile, isAuthenticated],
  );

  const resetNickname = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      setProfile({ ...profile, nickname: null });
      captureEvent("nickname reset", {
        synced_to_cloud: isAuthenticated,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível resetar.",
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [profile, setProfile, isAuthenticated]);

  return { updateNickname, resetNickname, isSaving, error };
}
