import { useCallback, useState } from "react";
import type { AvatarStyle, UseUpdateAvatarResult } from "../types/avatar";
import { useProfile } from "../lib/profile-context";
import { captureEvent } from "../lib/posthog";

// Contrato de migração futura para Supabase:
// - Tabela `profiles`: `avatar_seed text`, `avatar_style text default 'toon-head'`.
// - A URL do avatar é montada on-the-fly (buildAvatarUrl); nunca salvar a imagem.
// - Quando houver auth, basta trocar o corpo deste hook por:
//   supabase.from('profiles').upsert({ id: userId, avatar_seed: seed, avatar_style: style })
//   e ajustar profile-storage.ts. Os componentes não mudam.
export function useUpdateAvatar(): UseUpdateAvatarResult {
  const { profile, setProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useCallback(
    async (seed: string, style: AvatarStyle = "toon-head") => {
      setIsSaving(true);
      setError(null);
      try {
        setProfile({ ...profile, avatarSeed: seed, avatarStyle: style });
        captureEvent("avatar updated", {
          avatar_seed: seed,
          avatar_style: style,
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
    [profile, setProfile],
  );

  return { updateAvatar, isSaving, error };
}
