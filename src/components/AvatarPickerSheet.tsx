import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { AvatarSelection } from "../types/avatar";
import { useProfile } from "../lib/profile-context";
import { useUpdateAvatar } from "../hooks/useUpdateAvatar";
import { AvatarPicker } from "./AvatarPicker";

interface AvatarPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarPickerSheet({ isOpen, onClose }: AvatarPickerSheetProps) {
  const { profile } = useProfile();
  const { updateAvatar, isSaving } = useUpdateAvatar();

  const handleConfirm = async ({ seed, style }: AvatarSelection) => {
    try {
      await updateAvatar(seed, style);
      onClose();
    } catch {
      // Erro já registrado no hook; mantém o sheet aberto para nova tentativa.
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
                Escolher avatar
              </h2>
            </div>

            <AvatarPicker
              initialSeed={profile.avatarSeed}
              onConfirm={handleConfirm}
              onCancel={onClose}
              isSaving={isSaving}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
