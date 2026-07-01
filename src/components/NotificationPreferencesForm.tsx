import { useEffect, useState } from "react";
import { motion } from "../lib/motion";
import { useNotifications } from "../lib/notifications-context";
import {
  checkNotificationPermission,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "../lib/native-notifications";
import { type LeadMinutes } from "../lib/notification-preferences";
import { captureEvent } from "../lib/posthog";

const LEAD_OPTIONS: LeadMinutes[] = [5, 10, 15];

const PERMISSION_LABELS: Record<NotificationPermissionState, string> = {
  granted: "Ativadas no sistema",
  denied: "Bloqueadas no sistema",
  prompt: "Permissão não solicitada",
  unsupported: "Indisponível neste dispositivo",
};

export function NotificationPreferencesForm() {
  const { preferences, updatePreferences } = useNotifications();
  const [permission, setPermission] =
    useState<NotificationPermissionState>("unsupported");

  useEffect(() => {
    void checkNotificationPermission().then(setPermission);
  }, []);

  const handleLeadChange = (leadMinutes: LeadMinutes) => {
    if (preferences.leadMinutes === leadMinutes) return;
    const next = { ...preferences, leadMinutes };
    updatePreferences(next);
    captureEvent("notification preferences updated", {
      lead_minutes: leadMinutes,
      enabled_count: Object.values(next.enabled).filter(Boolean).length,
    });
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  return (
    <div className="space-y-6">
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
                  preferences.leadMinutes === minutes
                    ? "bg-mint-500/20 text-mint-400 border border-mint-500/30"
                    : "bg-white/[0.04] text-obsidian-300 border border-white/10 hover:bg-white/[0.08]"
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
