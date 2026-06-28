import { Timer } from "lucide-react";

interface DurationFieldsProps {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  error?: string | null;
  inputClass?: string;
}

export function DurationFields({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  error,
  inputClass = "input-sheet",
}: DurationFieldsProps) {
  return (
    <div>
      <label className="block text-xs text-obsidian-400 uppercase tracking-wide mb-2">
        Duração
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={8}
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          placeholder="0"
          aria-label="Horas"
          className={`${inputClass} w-12 shrink-0 px-2 text-center tabular-nums`}
        />
        <span className="shrink-0 text-sm text-obsidian-400">h</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          placeholder="30"
          aria-label="Minutos"
          className={`${inputClass} w-14 shrink-0 px-2 text-center tabular-nums`}
        />
        <span className="shrink-0 text-sm text-obsidian-400">min</span>
        <Timer
          className="h-4 w-4 shrink-0 text-white/90"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-coral-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
