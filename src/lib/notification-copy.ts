import type { Task } from "../components/TaskCard";
import type { NotificationType } from "../types/notification";
import type { NewNotification } from "./notification-storage";
import { dayKey } from "./day-stats";

export interface NotificationCopy {
  title: string;
  body: string;
}

export function taskUpcomingDedupKey(taskId: string, date?: Date): string {
  return `task-upcoming:${taskId}:${dayKey(date)}`;
}

export function taskOverdueDedupKey(taskId: string, date?: Date): string {
  return `task-overdue:${taskId}:${dayKey(date)}`;
}

export function timerFinishedDedupKey(taskId: string): string {
  return `timer-finished:${taskId}`;
}

export function taskCompletedDedupKey(taskId: string): string {
  return `task-completed:${taskId}`;
}

export function dailyGoalDedupKey(date?: Date): string {
  return `goal:${dayKey(date)}`;
}

export function streakMilestoneDedupKey(streak: number): string {
  return `streak:${streak}`;
}

export function streakAtRiskDedupKey(date?: Date): string {
  return `streak-risk:${dayKey(date)}`;
}

export function buildTaskUpcomingCopy(task: Task): NotificationCopy {
  return {
    title: "Tarefa chegando",
    body: `${task.title} começa às ${task.scheduledTime}. Prepare-se para iniciar.`,
  };
}

export function buildTaskOverdueCopy(task: Task): NotificationCopy {
  return {
    title: "Tarefa atrasada",
    body: `${task.title} era às ${task.scheduledTime} e ainda não foi iniciada.`,
  };
}

export function buildTimerFinishedCopy(task: Task): NotificationCopy {
  return {
    title: "Tarefa concluída",
    body: `Você concluiu ${task.title}. Bom trabalho!`,
  };
}

export function buildTaskCompletedCopy(task: Task): NotificationCopy {
  return {
    title: "Tarefa concluída",
    body: `Você concluiu ${task.title}. Bom trabalho!`,
  };
}

export function buildDailyGoalCopy(goalHours: number): NotificationCopy {
  return {
    title: "Meta diária atingida",
    body: `Você bateu a meta de ${goalHours}h de foco hoje. Continue assim!`,
  };
}

export function buildStreakMilestoneCopy(streak: number): NotificationCopy {
  return {
    title: `Sequência de ${streak} dias`,
    body: `${streak} dias seguidos com tarefas concluídas. Incrível!`,
  };
}

export function buildStreakAtRiskCopy(streak: number): NotificationCopy {
  return {
    title: "Não perca sua sequência",
    body: `Você ainda não concluiu nenhuma tarefa hoje. Falta pouco para manter os ${streak} dias!`,
  };
}

export function buildTaskUpcomingEntry(
  task: Task,
  date?: Date,
): NewNotification {
  const copy = buildTaskUpcomingCopy(task);
  return {
    type: "task_upcoming",
    ...copy,
    dedupKey: taskUpcomingDedupKey(task.id, date),
    taskId: task.id,
  };
}

export function buildTaskOverdueEntry(
  task: Task,
  date?: Date,
): NewNotification {
  const copy = buildTaskOverdueCopy(task);
  return {
    type: "task_overdue",
    ...copy,
    dedupKey: taskOverdueDedupKey(task.id, date),
    taskId: task.id,
  };
}

export function buildTimerFinishedEntry(task: Task): NewNotification {
  const copy = buildTimerFinishedCopy(task);
  return {
    type: "timer_finished",
    ...copy,
    dedupKey: timerFinishedDedupKey(task.id),
    taskId: task.id,
  };
}

export function buildTaskCompletedEntry(task: Task): NewNotification {
  const copy = buildTaskCompletedCopy(task);
  return {
    type: "task_completed",
    ...copy,
    dedupKey: taskCompletedDedupKey(task.id),
    taskId: task.id,
  };
}

export interface NativeNotificationExtra {
  type?: NotificationType;
  taskId?: string;
  dedupKey?: string;
  title?: string;
  body?: string;
}

export function parseNativeNotificationExtra(
  extra: unknown,
): NativeNotificationExtra {
  if (!extra || typeof extra !== "object") return {};
  return extra as NativeNotificationExtra;
}

export function extraToInboxEntry(
  extra: NativeNotificationExtra,
): NewNotification | null {
  if (!extra.type || !extra.dedupKey || !extra.title || !extra.body) {
    return null;
  }
  return {
    type: extra.type,
    title: extra.title,
    body: extra.body,
    dedupKey: extra.dedupKey,
    taskId: extra.taskId,
  };
}
