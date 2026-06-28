export const MIN_DURATION_SECONDS = 60;
export const MAX_DURATION_SECONDS = 8 * 3600;

export interface DurationParts {
  hours: number;
  minutes: number;
}

export function secondsToParts(seconds: number): DurationParts {
  const total = Math.max(0, Math.floor(seconds));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
  };
}

export function partsToSeconds(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60;
}

export function formatDuration(seconds: number): string {
  const { hours, minutes } = secondsToParts(seconds);
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes} min`;
}

export function partsToFieldStrings(seconds: number): {
  hours: string;
  minutes: string;
} {
  const { hours, minutes } = secondsToParts(seconds);
  return {
    hours: String(hours),
    minutes: String(minutes),
  };
}

export function validateDurationParts(
  hours: number,
  minutes: number,
): string | null {
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return "Duração inválida";
  }
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return "Use números inteiros";
  }
  if (hours < 0 || hours > 8) {
    return "Horas devem ser entre 0 e 8";
  }
  if (minutes < 0 || minutes > 59) {
    return "Minutos devem ser entre 0 e 59";
  }
  const total = partsToSeconds(hours, minutes);
  if (total < MIN_DURATION_SECONDS) {
    return "Duração mínima é 1 minuto";
  }
  if (total > MAX_DURATION_SECONDS) {
    return "Duração máxima é 8 horas";
  }
  return null;
}

export function parseDurationField(
  hoursStr: string,
  minutesStr: string,
): { ok: true; seconds: number } | { ok: false; error: string } {
  const hoursTrim = hoursStr.trim();
  const minutesTrim = minutesStr.trim();

  if (hoursTrim === "" && minutesTrim === "") {
    return { ok: false, error: "Informe a duração" };
  }

  const hours = hoursTrim === "" ? 0 : Number(hoursTrim);
  const minutes = minutesTrim === "" ? 0 : Number(minutesTrim);

  const error = validateDurationParts(hours, minutes);
  if (error) {
    return { ok: false, error };
  }

  return { ok: true, seconds: partsToSeconds(hours, minutes) };
}
