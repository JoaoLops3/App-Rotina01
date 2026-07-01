/** Meta padrão para usuários novos: 3 horas. */
export const DEFAULT_DAILY_GOAL_MINUTES = 180;

/** Meta legada (5h) — usada na migração de perfis locais já existentes. */
export const LEGACY_DAILY_GOAL_MINUTES = 300;

export const DAILY_GOAL_PRESETS = [60, 120, 180, 240, 300] as const;

export type DailyGoalPreset = (typeof DAILY_GOAL_PRESETS)[number];

export function formatDailyGoalLabel(minutes: number): string {
  const hours = minutes / 60;
  return hours === 1 ? "1h" : `${hours}h`;
}

export function isDailyGoalPreset(
  minutes: number,
): minutes is DailyGoalPreset {
  return (DAILY_GOAL_PRESETS as readonly number[]).includes(minutes);
}

/** Mescla meta local e remota sem sobrescrever escolha explícita do usuário. */
export function mergeDailyGoalMinutes(
  localMinutes: number,
  remoteMinutes: number,
): number {
  if (localMinutes === remoteMinutes) return remoteMinutes;

  const localIsDefault =
    localMinutes === DEFAULT_DAILY_GOAL_MINUTES ||
    localMinutes === LEGACY_DAILY_GOAL_MINUTES;
  const remoteIsDefault =
    remoteMinutes === DEFAULT_DAILY_GOAL_MINUTES ||
    remoteMinutes === LEGACY_DAILY_GOAL_MINUTES;

  if (!localIsDefault && remoteIsDefault) return localMinutes;
  if (localIsDefault && !remoteIsDefault) return remoteMinutes;
  return remoteMinutes;
}
