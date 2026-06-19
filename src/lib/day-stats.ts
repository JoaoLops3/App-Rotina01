import type { Task } from '../components/TaskCard';

const MOMENTUM_KEY = 'app_rotina_momentum';

export function getMomentum(): number {
  const stored = localStorage.getItem(MOMENTUM_KEY);
  if (!stored) return 0;
  const parsed = Number.parseInt(stored, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function addMomentum(amount = 1): number {
  const next = getMomentum() + amount;
  localStorage.setItem(MOMENTUM_KEY, String(next));
  return next;
}

export function computeFocusSeconds(tasks: Task[]): number {
  return tasks.reduce((sum, task) => {
    if (task.status === 'completed' || task.status === 'active' || task.status === 'paused') {
      return sum + task.elapsed;
    }
    return sum;
  }, 0);
}

export function formatFocusTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function computeGoalPercent(focusMinutes: number, dailyGoalMinutes: number): number {
  if (dailyGoalMinutes <= 0) return 0;
  return Math.min(Math.round((focusMinutes / dailyGoalMinutes) * 100), 100);
}

export function computeGoalProgressPercent(focusMinutes: number, dailyGoalMinutes: number): string {
  return `${computeGoalPercent(focusMinutes, dailyGoalMinutes)}% meta`;
}
