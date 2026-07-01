import { useCallback, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { useHoldStepper } from "../hooks/useHoldStepper";
import {
  DURATION_STEP_SECONDS,
  formatDuration,
  MAX_DURATION_SECONDS,
  stepDurationSeconds,
} from "../lib/task-duration";

interface DurationFieldsProps {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  error?: string | null;
}

const stepperButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-obsidian-300 transition-colors touch-manipulation hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none select-none";

export function DurationFields({
  durationSeconds,
  onDurationChange,
  error,
}: DurationFieldsProps) {
  const durationRef = useRef(durationSeconds);
  durationRef.current = durationSeconds;

  const atMin = durationSeconds <= DURATION_STEP_SECONDS;
  const atMax = durationSeconds >= MAX_DURATION_SECONDS;

  const step = useCallback(
    (delta: number): boolean => {
      const next = stepDurationSeconds(durationRef.current, delta);
      if (next === durationRef.current) return false;
      durationRef.current = next;
      onDurationChange(next);
      return true;
    },
    [onDurationChange],
  );

  const decrease = useHoldStepper(
    () => step(-DURATION_STEP_SECONDS),
    atMin,
  );
  const increase = useHoldStepper(
    () => step(DURATION_STEP_SECONDS),
    atMax,
  );

  return (
    <div className="w-fit">
      <label className="block text-xs text-obsidian-400 uppercase tracking-wide mb-2">
        Duração
      </label>
      <div className="flex h-12 w-fit items-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.04] px-1.5">
        <button
          type="button"
          disabled={atMin}
          className={stepperButtonClass}
          aria-label={`Diminuir ${DURATION_STEP_SECONDS / 60} minutos`}
          {...decrease}
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        <span className="shrink-0 px-1 text-sm tabular-nums text-white whitespace-nowrap">
          {formatDuration(durationSeconds)}
        </span>

        <button
          type="button"
          disabled={atMax}
          className={stepperButtonClass}
          aria-label={`Aumentar ${DURATION_STEP_SECONDS / 60} minutos`}
          {...increase}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-coral-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
