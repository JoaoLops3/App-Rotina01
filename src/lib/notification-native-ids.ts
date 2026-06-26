import { dayKey } from "./day-stats";

const KIND_OFFSET = {
  task_upcoming: 1_000_000,
  task_overdue: 2_000_000,
  timer_finished: 3_000_000,
  streak_at_risk: 4_000_000,
} as const;

/** IDs nativos do app ficam entre 1M (inclusive) e 5M (exclusive). */
export const NATIVE_NOTIFICATION_ID_MAX = 5_000_000;

export type NativeNotificationKind = keyof typeof KIND_OFFSET;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % 999_999;
}

export function nativeNotificationId(
  kind: NativeNotificationKind,
  taskId: string,
  date?: Date,
): number {
  const suffix =
    kind === "timer_finished" ? taskId : `${taskId}:${dayKey(date)}`;
  return KIND_OFFSET[kind] + hashString(suffix) + 1;
}

export function isTimerFinishedNotificationId(id: number): boolean {
  return id >= KIND_OFFSET.timer_finished && id < KIND_OFFSET.streak_at_risk;
}

export function nativeStreakAtRiskNotificationId(date?: Date): number {
  return KIND_OFFSET.streak_at_risk + hashString(dayKey(date)) + 1;
}

export function allNativeIdsForTask(
  taskId: string,
  date: Date = new Date(),
): number[] {
  return [
    nativeNotificationId("task_upcoming", taskId, date),
    nativeNotificationId("task_overdue", taskId, date),
    nativeNotificationId("timer_finished", taskId, date),
  ];
}
