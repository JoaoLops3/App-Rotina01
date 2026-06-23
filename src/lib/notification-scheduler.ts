import type { Task } from "../components/TaskCard";

/** Converte "HH:MM" em minutos desde a meia-noite, ou null se inválido. */
export function parseScheduledMinutes(time?: string): number | null {
  if (!time) return null;
  const [hours, mins] = time
    .split(":")
    .map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
  return hours * 60 + mins;
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function getUpcomingTaskReminders(
  tasks: Task[],
  now: Date = new Date(),
  leadMinutes = 10,
): Task[] {
  const nowMinutes = minutesOfDay(now);
  return tasks.filter((task) => {
    if (task.status !== "pending" && task.status !== "paused") return false;
    const scheduled = parseScheduledMinutes(task.scheduledTime);
    if (scheduled === null) return false;
    return nowMinutes >= scheduled - leadMinutes && nowMinutes <= scheduled;
  });
}
