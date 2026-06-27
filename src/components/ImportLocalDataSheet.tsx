import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "../lib/motion";
import { Upload, Sparkles } from "lucide-react";
import { useSync } from "../lib/sync-context";

export function ImportLocalDataSheet() {
  const { importPromptOpen, resolveImport, isSyncing } = useSync();
  const [error, setError] = useState<string | null>(null);

  const handleChoice = async (useLocalData: boolean) => {
    setError(null);
    try {
      await resolveImport(useLocalData);
    } catch {
      setError("Não foi possível sincronizar. Tente novamente.");
    }
  };

  return createPortal(
    <AnimatePresence>
      {importPromptOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 w-full max-w-xl rounded-t-[28px] border border-white/10 bg-[#14141c] px-5 pt-6 pb-[max(env(safe-area-inset-bottom),1.25rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />

            <h2
              className="font-display text-xl font-semibold text-white"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Sincronizar este aparelho
            </h2>
            <p className="mt-2 text-sm text-obsidian-400 leading-relaxed">
              Encontramos tarefas e dados salvos localmente. O que você quer
              fazer com eles na sua conta na nuvem?
            </p>

            {error ? (
              <p className="mt-3 text-sm text-coral-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => void handleChoice(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-mint-500/30 bg-mint-500/10 px-4 py-4 text-left transition-colors hover:bg-mint-500/15 disabled:opacity-50 touch-manipulation"
              >
                <Upload className="h-5 w-5 shrink-0 text-mint-400" />
                <span>
                  <span className="block text-sm font-medium text-white">
                    Usar o que já tenho neste aparelho
                  </span>
                  <span className="mt-0.5 block text-xs text-obsidian-400">
                    Envia tarefas, histórico e perfil para a nuvem
                  </span>
                </span>
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={() => void handleChoice(false)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50 touch-manipulation"
              >
                <Sparkles className="h-5 w-5 shrink-0 text-obsidian-300" />
                <span>
                  <span className="block text-sm font-medium text-white">
                    Começar do zero na nuvem
                  </span>
                  <span className="mt-0.5 block text-xs text-obsidian-400">
                    Limpa os dados locais e inicia uma conta vazia
                  </span>
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
