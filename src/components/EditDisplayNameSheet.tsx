import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "../lib/motion";
import { AuthFormField } from "./AuthFormField";
import { useProfile } from "../lib/profile-context";
import { useUpdateNickname } from "../hooks/useUpdateNickname";
import {
  getShownName,
  PROFILE_HEADER_NAME_MAX_LENGTH,
} from "../lib/profile-storage";

interface EditDisplayNameSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditDisplayNameSheet({
  isOpen,
  onClose,
}: EditDisplayNameSheetProps) {
  const { profile } = useProfile();
  const { updateNickname, isSaving, error } = useUpdateNickname();
  const [nickname, setNickname] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNickname(
        getShownName(profile).slice(0, PROFILE_HEADER_NAME_MAX_LENGTH),
      );
      setFieldError(null);
    }
  }, [isOpen, profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    try {
      await updateNickname(nickname);
      onClose();
    } catch (err) {
      setFieldError(
        err instanceof Error ? err.message : "Não foi possível salvar.",
      );
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={isSaving ? undefined : onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-lg card-glass rounded-b-none p-5 pb-8"
            style={{
              paddingBottom: "calc(2rem + env(safe-area-inset-bottom))",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

            <div className="mb-5">
              <h2
                className="font-display text-xl font-semibold text-white"
                style={{ fontFamily: "Space Grotesk" }}
              >
                Editar nome
              </h2>
              <p className="mt-1 text-sm text-obsidian-400">
                Como quer ser chamado no app?
              </p>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <AuthFormField
                id="edit-nickname"
                label="Nome no app"
                type="text"
                value={nickname}
                onChange={(value) =>
                  setNickname(value.slice(0, PROFILE_HEADER_NAME_MAX_LENGTH))
                }
                autoComplete="nickname"
                placeholder="Como quer ser chamado?"
                maxLength={PROFILE_HEADER_NAME_MAX_LENGTH}
                error={fieldError ?? error ?? undefined}
              />

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 text-sm font-medium text-obsidian-200 transition-colors hover:bg-white/[0.08] disabled:opacity-50 touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
                >
                  {isSaving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
