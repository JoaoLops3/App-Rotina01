export type NotificationType =
  | "task_upcoming" // lembrete ~10 min antes do horário agendado
  | "task_completed" // tarefa concluída
  | "daily_goal_reached" // meta de foco do dia
  | "streak_milestone" // marco de sequência (3, 7, 14, 30 dias)
  | "streak_at_risk"; // alerta para não perder a sequência

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
