import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { Task } from "../components/TaskCard";
import type { DayStat } from "./day-stats";
import { saveHistory } from "./day-stats";
import type { NotificationPreferences } from "./notification-preferences";
import { saveNotifications } from "./notification-storage";
import { savePreferences } from "./notification-preferences";
import { saveProfile } from "./profile-storage";
import { saveTasks } from "./storage";
import type { UserProfile } from "../types/avatar";
import type { AppNotification } from "../types/notification";
import { useAuth } from "./auth-context";
import { captureEvent } from "./posthog";
import {
  hasCloudData,
  markLocalImportDone,
  pullUserSnapshot,
  pushUserSnapshot,
  syncHistoryToCloud,
  syncNotificationsToCloud,
  syncPreferencesToCloud,
  syncProfileToCloud,
  syncTasksToCloud,
} from "./sync/cloud-sync";
import {
  EMPTY_SNAPSHOT,
  hasMeaningfulLocalData,
  readLocalSnapshot,
  type UserDataSnapshot,
} from "./sync/mappers";

const PUSH_DEBOUNCE_MS = 800;

export interface SyncHandlers {
  applyTasks?: (tasks: Task[]) => void;
  applyProfile?: (profile: UserProfile) => void;
  applyHistory?: (history: DayStat[]) => void;
  applyNotifications?: (notifications: AppNotification[]) => void;
  applyPreferences?: (preferences: NotificationPreferences) => void;
}

interface SyncContextValue {
  isSyncing: boolean;
  isApplyingRemote: boolean;
  importPromptOpen: boolean;
  registerSyncHandlers: (handlers: SyncHandlers) => void;
  scheduleTasksPush: (tasks: Task[]) => void;
  scheduleHistoryPush: (history: DayStat[]) => void;
  scheduleProfilePush: (profile: UserProfile) => void;
  schedulePreferencesPush: (preferences: NotificationPreferences) => void;
  scheduleNotificationsPush: (notifications: AppNotification[]) => void;
  resolveImport: (useLocalData: boolean) => Promise<void>;
  refreshFromCloud: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSync deve ser usado dentro de um SyncProvider");
  }
  return ctx;
}

function persistSnapshotLocally(snapshot: UserDataSnapshot): void {
  saveTasks(snapshot.tasks);
  saveProfile(snapshot.profile);
  saveHistory(snapshot.history);
  savePreferences(snapshot.preferences);
  saveNotifications(snapshot.notifications);
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [isSyncing, setIsSyncing] = useState(false);
  const [isApplyingRemote, setIsApplyingRemote] = useState(false);
  const [importPromptOpen, setImportPromptOpen] = useState(false);
  const isApplyingRemoteRef = useRef(false);
  const handlersRef = useRef<SyncHandlers>({});
  const pushTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const initialSyncDoneRef = useRef<string | null>(null);

  const registerSyncHandlers = useCallback((handlers: SyncHandlers) => {
    handlersRef.current = { ...handlersRef.current, ...handlers };
  }, []);

  const applySnapshot = useCallback((snapshot: UserDataSnapshot) => {
    isApplyingRemoteRef.current = true;
    setIsApplyingRemote(true);
    handlersRef.current.applyTasks?.(snapshot.tasks);
    handlersRef.current.applyProfile?.(snapshot.profile);
    handlersRef.current.applyHistory?.(snapshot.history);
    handlersRef.current.applyNotifications?.(snapshot.notifications);
    handlersRef.current.applyPreferences?.(snapshot.preferences);
    persistSnapshotLocally(snapshot);
    window.setTimeout(() => {
      isApplyingRemoteRef.current = false;
      setIsApplyingRemote(false);
    }, 0);
  }, []);

  const runInitialSync = useCallback(
    async (uid: string) => {
      setIsSyncing(true);
      try {
        const cloudExists = await hasCloudData(uid);
        const localExists = hasMeaningfulLocalData();

        if (!cloudExists && localExists) {
          setImportPromptOpen(true);
          return;
        }

        if (cloudExists) {
          const snapshot = await pullUserSnapshot(uid);
          applySnapshot(snapshot);
          if (!snapshot.localImportDone) {
            await markLocalImportDone(uid);
          }
          captureEvent("sync pulled from cloud");
        } else {
          await markLocalImportDone(uid);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [applySnapshot],
  );

  const refreshFromCloud = useCallback(async () => {
    if (!userId) return;
    setIsSyncing(true);
    try {
      const snapshot = await pullUserSnapshot(userId);
      applySnapshot(snapshot);
      captureEvent("sync refreshed from cloud");
    } finally {
      setIsSyncing(false);
    }
  }, [userId, applySnapshot]);

  const resolveImport = useCallback(
    async (useLocalData: boolean) => {
      if (!userId) return;
      setImportPromptOpen(false);
      setIsSyncing(true);
      try {
        if (useLocalData) {
          const snapshot = readLocalSnapshot();
          await pushUserSnapshot(userId, snapshot, true);
          captureEvent("sync imported local data");
        } else {
          applySnapshot(EMPTY_SNAPSHOT);
          await markLocalImportDone(userId);
          captureEvent("sync started fresh on cloud");
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [userId, applySnapshot],
  );

  const schedulePush = useCallback(
    (key: string, fn: () => Promise<void>) => {
      if (!userId || isApplyingRemoteRef.current) return;

      const existing = pushTimersRef.current[key];
      if (existing) clearTimeout(existing);

      pushTimersRef.current[key] = setTimeout(() => {
        void fn();
      }, PUSH_DEBOUNCE_MS);
    },
    [userId],
  );

  const scheduleTasksPush = useCallback(
    (tasks: Task[]) => {
      schedulePush("tasks", () => syncTasksToCloud(userId!, tasks));
    },
    [schedulePush, userId],
  );

  const scheduleHistoryPush = useCallback(
    (history: DayStat[]) => {
      schedulePush("history", () => syncHistoryToCloud(userId!, history));
    },
    [schedulePush, userId],
  );

  const scheduleProfilePush = useCallback(
    (profile: UserProfile) => {
      schedulePush("profile", () => syncProfileToCloud(userId!, profile));
    },
    [schedulePush, userId],
  );

  const schedulePreferencesPush = useCallback(
    (preferences: NotificationPreferences) => {
      schedulePush("preferences", () =>
        syncPreferencesToCloud(userId!, preferences),
      );
    },
    [schedulePush, userId],
  );

  const scheduleNotificationsPush = useCallback(
    (notifications: AppNotification[]) => {
      schedulePush("notifications", () =>
        syncNotificationsToCloud(userId!, notifications),
      );
    },
    [schedulePush, userId],
  );

  useEffect(() => {
    if (authLoading || !isAuthenticated || !userId) {
      initialSyncDoneRef.current = null;
      setImportPromptOpen(false);
      return;
    }

    if (initialSyncDoneRef.current === userId) return;
    initialSyncDoneRef.current = userId;
    void runInitialSync(userId);
  }, [authLoading, isAuthenticated, userId, runInitialSync]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId) return;

    const listener = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive && !importPromptOpen) {
        void refreshFromCloud();
      }
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [userId, importPromptOpen, refreshFromCloud]);

  useEffect(() => {
    return () => {
      Object.values(pushTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const value = useMemo<SyncContextValue>(
    () => ({
      isSyncing,
      isApplyingRemote,
      importPromptOpen,
      registerSyncHandlers,
      scheduleTasksPush,
      scheduleHistoryPush,
      scheduleProfilePush,
      schedulePreferencesPush,
      scheduleNotificationsPush,
      resolveImport,
      refreshFromCloud,
    }),
    [
      isSyncing,
      isApplyingRemote,
      importPromptOpen,
      registerSyncHandlers,
      scheduleTasksPush,
      scheduleHistoryPush,
      scheduleProfilePush,
      schedulePreferencesPush,
      scheduleNotificationsPush,
      resolveImport,
      refreshFromCloud,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
