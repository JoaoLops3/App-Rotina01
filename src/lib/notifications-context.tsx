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
import type { AppNotification } from "../types/notification";
import {
  addNotification,
  loadNotifications,
  markAllAsRead as markAllReadStore,
  markAsRead as markReadStore,
  saveNotifications,
  type NewNotification,
} from "./notification-storage";
import { computeFocusSeconds, dayKey } from "./day-stats";
import { getUpcomingTaskReminders } from "./notification-scheduler";
import { DAILY_GOAL_MINUTES, useTasks } from "./tasks-context";

const POLL_INTERVAL_MS = 60_000;
const STREAK_MILESTONES = [3, 7, 14, 30];
const STREAK_RISK_HOUR = 20;

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications deve ser usado dentro de um NotificationsProvider",
    );
  }
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { tasks, streak } = useTasks();
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadNotifications(),
  );

  // Refs com o estado mais recente para o polling não recriar o intervalo a
  // cada tick do timer da tarefa ativa (que altera `tasks` a cada segundo).
  const tasksRef = useRef(tasks);
  const streakRef = useRef(streak);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  // Conclusões já conhecidas: evita notificar tarefas já concluídas ao abrir.
  const knownCompletedRef = useRef<Set<string>>(
    new Set(tasks.filter((t) => t.status === "completed").map((t) => t.id)),
  );

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const push = useCallback((entry: NewNotification) => {
    setNotifications((prev) => addNotification(prev, entry));
  }, []);

  const runGeneration = useCallback(() => {
    const now = new Date();
    const currentTasks = tasksRef.current;
    const currentStreak = streakRef.current;
    const today = dayKey(now);

    // Lembrete ~10 min antes do horário agendado.
    getUpcomingTaskReminders(currentTasks, now).forEach((task) => {
      push({
        type: "task_upcoming",
        title: "Tarefa chegando",
        body: `${task.title} começa às ${task.scheduledTime}. Prepare-se para iniciar.`,
        dedupKey: `task-upcoming:${task.id}:${today}`,
        taskId: task.id,
      });
    });

    // Meta diária de foco atingida (1x por dia).
    const focusMinutes = Math.floor(computeFocusSeconds(currentTasks) / 60);
    if (focusMinutes >= DAILY_GOAL_MINUTES) {
      const goalHours = Math.round(DAILY_GOAL_MINUTES / 60);
      push({
        type: "daily_goal_reached",
        title: "Meta diária atingida",
        body: `Você bateu a meta de ${goalHours}h de foco hoje. Continue assim!`,
        dedupKey: `goal:${today}`,
      });
    }

    // Marco de sequência (3, 7, 14, 30 dias) — 1x cada.
    if (STREAK_MILESTONES.includes(currentStreak)) {
      push({
        type: "streak_milestone",
        title: `Sequência de ${currentStreak} dias`,
        body: `${currentStreak} dias seguidos com tarefas concluídas. Incrível!`,
        dedupKey: `streak:${currentStreak}`,
      });
    }

    // Sequência em risco: após 20h, com streak ativo e 0 conclusões hoje.
    const completedToday = currentTasks.filter(
      (t) => t.status === "completed",
    ).length;
    if (
      now.getHours() >= STREAK_RISK_HOUR &&
      currentStreak > 0 &&
      completedToday === 0
    ) {
      push({
        type: "streak_at_risk",
        title: "Não perca sua sequência",
        body: `Você ainda não concluiu nenhuma tarefa hoje. Falta pouco para manter os ${currentStreak} dias!`,
        dedupKey: `streak-risk:${today}`,
      });
    }
  }, [push]);

  // Tarefa concluída: dispara imediatamente na transição para `completed`.
  useEffect(() => {
    tasks.forEach((task) => {
      if (
        task.status === "completed" &&
        !knownCompletedRef.current.has(task.id)
      ) {
        knownCompletedRef.current.add(task.id);
        push({
          type: "task_completed",
          title: "Tarefa concluída",
          body: `Você concluiu ${task.title}. Bom trabalho!`,
          dedupKey: `task-completed:${task.id}`,
          taskId: task.id,
        });
      }
    });
  }, [tasks, push]);

  // Polling a cada 60s (lembretes, meta e risco) enquanto o app está aberto.
  useEffect(() => {
    runGeneration();
    const interval = setInterval(runGeneration, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [runGeneration]);

  // Reage imediatamente a mudanças de sequência (marcos / risco).
  useEffect(() => {
    runGeneration();
  }, [streak, runGeneration]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => markReadStore(prev, id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => markAllReadStore(prev));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead }),
    [notifications, unreadCount, markAsRead, markAllAsRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
