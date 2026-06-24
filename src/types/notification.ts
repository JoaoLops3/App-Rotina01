export type NotificationType =
  | "task_upcoming"
  | "task_completed"
  | "daily_goal_reached"
  | "streak_milestone"
  | "streak_at_risk"
  | "task_overdue"
  | "timer_finished";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  dedupKey: string;
  taskId?: string;
}
