import { loadHistory } from "./day-stats";
import { loadNotifications } from "./notification-storage";
import { loadPreferences } from "./notification-preferences";
import { loadProfile } from "./profile-storage";
import { loadTasks } from "./storage";

export const LOCAL_STORAGE_KEYS = [
  "app-rotina:tasks",
  "app-rotina:history",
  "app-rotina:profile",
  "app-rotina:notifications",
  "app-rotina:notification-preferences",
] as const;

export function clearAllLocalAppData(): void {
  for (const key of LOCAL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage indisponível.
    }
  }
}

export interface UserDataExportPayload {
  exportedAt: string;
  app: "App Rotina";
  version: "1.0";
  accountEmail: string | null;
  tasks: ReturnType<typeof loadTasks>;
  history: ReturnType<typeof loadHistory>;
  profile: ReturnType<typeof loadProfile>;
  notifications: ReturnType<typeof loadNotifications>;
  notificationPreferences: ReturnType<typeof loadPreferences>;
}

export function buildUserDataExport(
  accountEmail?: string | null,
): UserDataExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    app: "App Rotina",
    version: "1.0",
    accountEmail: accountEmail ?? null,
    tasks: loadTasks() ?? [],
    history: loadHistory(),
    profile: loadProfile(),
    notifications: loadNotifications(),
    notificationPreferences: loadPreferences(),
  };
}

export async function downloadUserDataExport(
  accountEmail?: string | null,
): Promise<void> {
  const payload = buildUserDataExport(accountEmail);
  const json = JSON.stringify(payload, null, 2);
  const filename = `app-rotina-dados-${new Date().toISOString().slice(0, 10)}.json`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([json], filename, { type: "application/json" });
      await navigator.share({
        title: "Exportar dados — App Rotina",
        files: [file],
      });
      return;
    } catch {
      // Usuário cancelou ou share indisponível — fallback para download.
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
