import type { Task } from "../../components/TaskCard";
import type { DayStat } from "../day-stats";
import { loadHistory } from "../day-stats";
import { loadNotifications } from "../notification-storage";
import { loadPreferences } from "../notification-preferences";
import { loadProfile } from "../profile-storage";
import { loadTasks } from "../storage";
import type { UserProfile } from "../../types/avatar";
import type { AppNotification } from "../../types/notification";
import type {
  DayHistoryRow,
  NotificationRow,
  ProfileRow,
  TaskRow,
} from "../../types/database";
import type { Database } from "../../types/database";
import type { NotificationPreferences } from "../notification-preferences";

export interface UserDataSnapshot {
  tasks: Task[];
  history: DayStat[];
  profile: UserProfile;
  preferences: NotificationPreferences;
  notifications: AppNotification[];
  localImportDone: boolean;
}

export function taskToRow(
  task: Task,
  userId: string,
): Database["public"]["Tables"]["tasks"]["Insert"] {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    category: task.category,
    duration: task.duration,
    elapsed: task.elapsed,
    status: task.status,
    priority: task.priority,
    scheduled_time: task.scheduledTime ?? null,
    completed_at: task.completedAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    duration: row.duration,
    elapsed: row.elapsed,
    status: row.status,
    priority: row.priority,
    scheduledTime: row.scheduled_time ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}

export function profileToRow(
  profile: UserProfile,
  userId: string,
  localImportDone: boolean,
): Database["public"]["Tables"]["profiles"]["Insert"] {
  return {
    id: userId,
    display_name: profile.displayName,
    avatar_seed: profile.avatarSeed,
    avatar_style: profile.avatarStyle,
    local_import_done: localImportDone,
  };
}

export function rowToProfile(row: ProfileRow): UserProfile {
  return {
    displayName: row.display_name,
    avatarSeed: row.avatar_seed,
    avatarStyle: "toon-head",
  };
}

export function dayStatToRow(stat: DayStat, userId: string): DayHistoryRow {
  return {
    user_id: userId,
    date: stat.date,
    tasks_completed: stat.tasksCompleted,
    focus_seconds: stat.focusSeconds,
  };
}

export function rowToDayStat(row: DayHistoryRow): DayStat {
  return {
    date: row.date,
    tasksCompleted: row.tasks_completed,
    focusSeconds: row.focus_seconds,
  };
}

export function notificationToRow(
  notification: AppNotification,
  userId: string,
): NotificationRow {
  return {
    id: notification.id,
    user_id: userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    created_at: notification.createdAt,
    read: notification.read,
    dedup_key: notification.dedupKey,
    task_id: notification.taskId ?? null,
  };
}

export function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
    dedupKey: row.dedup_key,
    taskId: row.task_id ?? undefined,
  };
}

export function readLocalSnapshot(): UserDataSnapshot {
  return {
    tasks: loadTasks() ?? [],
    history: loadHistory(),
    profile: loadProfile(),
    preferences: loadPreferences(),
    notifications: loadNotifications(),
    localImportDone: false,
  };
}

export function hasMeaningfulLocalData(): boolean {
  const snapshot = readLocalSnapshot();
  if (snapshot.tasks.length > 0) return true;
  if (snapshot.history.length > 0) return true;
  if (snapshot.notifications.length > 0) return true;
  if (snapshot.profile.avatarSeed) return true;
  if (snapshot.profile.displayName !== "Alex") return true;
  return false;
}

export const EMPTY_SNAPSHOT: UserDataSnapshot = {
  tasks: [],
  history: [],
  profile: { displayName: "Alex", avatarSeed: null, avatarStyle: "toon-head" },
  preferences: readLocalSnapshot().preferences,
  notifications: [],
  localImportDone: true,
};
