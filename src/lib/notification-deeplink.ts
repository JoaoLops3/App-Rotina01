import type { NotificationType } from "../types/notification";

export interface NotificationNavigationTarget {
  pathname: string;
  search?: string;
}

export function getNotificationNavigationTarget(
  type: NotificationType,
  taskId?: string,
): NotificationNavigationTarget {
  if (type === "task_upcoming") {
    return { pathname: "/agenda" };
  }
  if (
    taskId &&
    (type === "task_overdue" ||
      type === "timer_finished" ||
      type === "task_completed")
  ) {
    return { pathname: "/", search: `?highlightTask=${taskId}` };
  }
  if (type === "streak_at_risk") {
    return { pathname: "/" };
  }
  return { pathname: "/" };
}
