import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { OrbBackground } from "../components/OrbBackground";
import { useNotifications } from "../lib/notifications-context";
import {
  checkNotificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "../lib/native-notifications";
import {
  INBOX_NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  PUSH_NOTIFICATION_TYPES,
  type LeadMinutes,
  type NotificationPreferences,
} from "../lib/notification-preferences";
import type { NotificationType } from "../types/notification";
import { captureEvent } from "../lib/posthog";

const LEAD_OPTIONS: LeadMinutes[] = [5, 10, 15];

const PERMISSION_LABELS: Record<NotificationPermissionState, string> = {
  granted: "Ativadas no sistema",
  denied: "Bloqueadas no sistema",
  prompt: "Permissão não solicitada",
  unsupported: "Indisponível neste dispositivo",
};

interface ToggleRowProps {
  type: NotificationType;
  checked: boolean;
  onToggle: (type: NotificationType) => void;
}

function ToggleRow({ type, checked, onToggle }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onToggle(type)}
      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors touch-manipulation"
    >
      <span className="text-sm font-medium text-obsidian-200">
        {NOTIFICATION_TYPE_LABELS[type]}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-mint-500/40" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function NotificationPreferencesScreen() {
  const history = useHistory();
  const { preferences, updatePreferences } = useNotifications();
  const [draft, setDraft] = useState<NotificationPreferences>(preferences);
  const [permission, setPermission] =
    useState<NotificationPermissionState>("unsupported");

  useEffect(() => {
    void checkNotificationPermission().then(setPermission);
  }, []);

  const handleToggle = (type: NotificationType) => {
    setDraft((prev) => ({
      ...prev,
      enabled: { ...prev.enabled, [type]: !prev.enabled[type] },
    }));
  };

  const handleLeadChange = (leadMinutes: LeadMinutes) => {
    setDraft((prev) => ({ ...prev, leadMinutes }));
  };

  const handleSave = () => {
    updatePreferences(draft);
    captureEvent("notification preferences updated", {
      lead_minutes: draft.leadMinutes,
      enabled_count: Object.values(draft.enabled).filter(Boolean).length,
    });
    history.goBack();
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-content-custom">
        <OrbBackground />

        <div className="relative z-10 min-h-screen pb-32 md:mx-auto md:max-w-xl">
          <div className="px-4 pt-safe pb-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.button
                type="button"
                onClick={() => history.goBack()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-secondary text-obsidian-200 transition-colors hover:bg-surface-tertiary touch-manipulation"
                aria-label="Voltar"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </motion.button>

              <h1
                className="mt-3 mb-0 font-display font-semibold text-2xl text-white tracking-tight"
                style={{ fontFamily: "Space Grotesk" }}
              >
                Preferências de alertas
              </h1>
              <p className="text-obsidian-500 text-sm mt-1">
                Configure alertas no celular e na central do app.
              </p>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="card-glass p-5 space-y-4"
            >
              <div>
                <p className="m-0 text-xs font-medium uppercase tracking-wide text-obsidian-500">
                  Permissão do sistema
                </p>
                <p className="m-0 mt-2 text-sm text-obsidian-200">
                  {PERMISSION_LABELS[permission]}
                </p>
              </div>
              {permission !== "granted" && permission !== "unsupported" && (
                <button
                  type="button"
                  onClick={() => void handleRequestPermission()}
                  className="w-full rounded-2xl border border-mint-500/30 bg-mint-500/10 py-3 text-sm font-medium text-mint-400 transition-colors hover:bg-mint-500/20 touch-manipulation"
                >
                  Ativar notificações
                </button>
              )}
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="space-y-2"
            >
              <div className="px-1">
                <p className="m-0 text-xs font-medium uppercase tracking-wide text-obsidian-500">
                  Alertas no celular
                </p>
                <p className="m-0 mt-1 text-xs text-obsidian-500">
                  Funcionam com o app fechado ou em segundo plano.
                </p>
              </div>
              <div className="card-glass p-5 space-y-3">
                <p className="m-0 text-xs font-medium uppercase tracking-wide text-obsidian-500">
                  Antecedência do lembrete
                </p>
                <div className="flex gap-2">
                  {LEAD_OPTIONS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => handleLeadChange(minutes)}
                      className={`flex-1 rounded-2xl py-2.5 text-sm font-medium transition-colors touch-manipulation ${
                        draft.leadMinutes === minutes
                          ? "bg-mint-500/20 text-mint-400 border border-mint-500/30"
                          : "bg-white/[0.04] text-obsidian-300 border border-white/10 hover:bg-white/[0.08]"
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-glass divide-y divide-white/5 overflow-hidden">
                {PUSH_NOTIFICATION_TYPES.map((type) => (
                  <ToggleRow
                    key={type}
                    type={type}
                    checked={draft.enabled[type]}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="space-y-2"
            >
              <div className="px-1">
                <p className="m-0 text-xs font-medium uppercase tracking-wide text-obsidian-500">
                  Central do app
                </p>
                <p className="m-0 mt-1 text-xs text-obsidian-500">
                  Aparecem na tela de notificações com o app aberto.
                </p>
              </div>
              <div className="card-glass divide-y divide-white/5 overflow-hidden">
                {INBOX_NOTIFICATION_TYPES.map((type) => (
                  <ToggleRow
                    key={type}
                    type={type}
                    checked={draft.enabled[type]}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </motion.div>

            <motion.button
              type="button"
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl bg-mint-500/20 border border-mint-500/30 py-3.5 text-sm font-semibold text-mint-400 transition-colors hover:bg-mint-500/30 touch-manipulation"
            >
              Salvar preferências
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
