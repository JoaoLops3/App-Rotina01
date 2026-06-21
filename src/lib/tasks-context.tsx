import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Task, TaskStatus } from "../components/TaskCard";
import { loadTasks, saveTasks } from "./storage";
import {
  computeFocusSeconds,
  computeStreak,
  loadHistory,
  recordToday,
} from "./day-stats";
import { captureEvent } from "./posthog";

const MINUTE = 60;

export const DAILY_GOAL_MINUTES = 300;

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Sessão de Trabalho Profundo",
    category: "Focus",
    duration: 90 * MINUTE,
    elapsed: 42 * MINUTE,
    status: "active",
    priority: "high",
    scheduledTime: "09:00",
  },
  {
    id: "2",
    title: "Revisão de Design",
    category: "Criativo",
    duration: 45 * MINUTE,
    elapsed: 45 * MINUTE,
    status: "completed",
    priority: "medium",
    scheduledTime: "11:00",
  },
  {
    id: "3",
    title: "Pausa para Meditação",
    category: "Saúde",
    duration: 15 * MINUTE,
    elapsed: 0,
    status: "pending",
    priority: "low",
    scheduledTime: "12:30",
  },
  {
    id: "4",
    title: "Call Estratégico com Equipe",
    category: "Comunicação",
    duration: 30 * MINUTE,
    elapsed: 0,
    status: "pending",
    priority: "high",
    scheduledTime: "14:00",
  },
  {
    id: "5",
    title: "Pesquisa e Aprendizado",
    category: "Focus",
    duration: 60 * MINUTE,
    elapsed: 0,
    status: "pending",
    priority: "medium",
  },
  {
    id: "6",
    title: "Treino na Academia",
    category: "Saúde",
    duration: 60 * MINUTE,
    elapsed: 0,
    status: "pending",
    priority: "medium",
    scheduledTime: "18:00",
  },
  {
    id: "7",
    title: "Planejamento do Dia Seguinte",
    category: "Focus",
    duration: 20 * MINUTE,
    elapsed: 0,
    status: "pending",
    priority: "low",
    scheduledTime: "21:00",
  },
];

interface TasksContextValue {
  tasks: Task[];
  streak: number;
  isNewTaskOpen: boolean;
  taskToEdit: Task | null;
  openNewTask: () => void;
  editTask: (id: string) => void;
  closeTaskSheet: () => void;
  submitTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  changeStatus: (id: string, status: TaskStatus) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks deve ser usado dentro de um TasksProvider");
  }
  return ctx;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks() ?? sampleTasks);
  const [streak, setStreak] = useState(() => computeStreak(loadHistory()));
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const taskToEdit = editingTaskId
    ? (tasks.find((t) => t.id === editingTaskId) ?? null)
    : null;

  const activeTask = tasks.find((t) => t.status === "active");
  const focusSeconds = computeFocusSeconds(tasks);
  const focusMinutes = Math.floor(focusSeconds / 60);
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const completedRecordedRef = useRef<Set<string>>(
    new Set(
      sampleTasks.filter((t) => t.status === "completed").map((t) => t.id),
    ),
  );

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (!activeTask) return;

    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (
            task.id === activeTask.id &&
            task.status === "active" &&
            task.elapsed < task.duration
          ) {
            const nextElapsed = task.elapsed + 1;
            if (nextElapsed >= task.duration) {
              return {
                ...task,
                elapsed: task.duration,
                status: "completed" as TaskStatus,
              };
            }
            return { ...task, elapsed: nextElapsed };
          }
          return task;
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  useEffect(() => {
    const history = recordToday({
      tasksCompleted: completedCount,
      focusSeconds,
    });
    setStreak(computeStreak(history));
  }, [completedCount, focusMinutes]);

  useEffect(() => {
    tasks.forEach((task) => {
      if (
        task.status === "completed" &&
        !completedRecordedRef.current.has(task.id)
      ) {
        completedRecordedRef.current.add(task.id);
        captureEvent("task completed", {
          task_id: task.id,
          task_title: task.title,
          task_category: task.category,
          task_priority: task.priority,
          task_duration_minutes: Math.floor(task.duration / 60),
          task_elapsed_minutes: Math.floor(task.elapsed / 60),
          completion_rate: Math.round((task.elapsed / task.duration) * 100),
        });
      }
    });
  }, [tasks]);

  const submitTask = (task: Task) => {
    if (editingTaskId) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      captureEvent("task edited", {
        task_id: task.id,
        task_title: task.title,
        task_category: task.category,
        task_priority: task.priority,
        task_duration_minutes: Math.floor(task.duration / 60),
        has_scheduled_time: Boolean(task.scheduledTime),
      });
      return;
    }
    setTasks((prev) => [...prev, task]);
    captureEvent("task created", {
      task_id: task.id,
      task_title: task.title,
      task_category: task.category,
      task_priority: task.priority,
      task_duration_minutes: Math.floor(task.duration / 60),
      has_scheduled_time: Boolean(task.scheduledTime),
    });
  };

  const openNewTask = () => {
    setEditingTaskId(null);
    setIsNewTaskOpen(true);
  };

  const editTask = (id: string) => {
    setEditingTaskId(id);
    setIsNewTaskOpen(true);
  };

  const closeTaskSheet = () => {
    setIsNewTaskOpen(false);
    setEditingTaskId(null);
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    completedRecordedRef.current.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      captureEvent("task deleted", {
        task_id: target.id,
        task_title: target.title,
        task_category: target.category,
        task_status: target.status,
      });
    }
  };

  const changeStatus = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task,
      );
      if (newStatus === "active") {
        return updated.map((task) =>
          task.id === id
            ? task
            : task.status === "active"
              ? { ...task, status: "paused" }
              : task,
        );
      }
      return updated;
    });
  };

  const value: TasksContextValue = {
    tasks,
    streak,
    isNewTaskOpen,
    taskToEdit,
    openNewTask,
    editTask,
    closeTaskSheet,
    submitTask,
    deleteTask,
    changeStatus,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
