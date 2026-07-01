import { useCallback, useRef, type MouseEvent, type PointerEvent } from "react";

const INITIAL_DELAY_MS = 400;
const START_INTERVAL_MS = 120;
const MIN_INTERVAL_MS = 40;
const ACCELERATION = 0.82;

export function useHoldStepper(onStep: () => boolean | void, disabled: boolean) {
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const timersRef = useRef<{
    initial?: ReturnType<typeof setTimeout>;
    repeat?: ReturnType<typeof setTimeout>;
  }>({});
  const heldRepeatRef = useRef(false);
  const intervalMsRef = useRef(START_INTERVAL_MS);

  const clear = useCallback(() => {
    const { initial, repeat } = timersRef.current;
    if (initial) clearTimeout(initial);
    if (repeat) clearTimeout(repeat);
    timersRef.current = {};
  }, []);

  const scheduleRepeat = useCallback(() => {
    timersRef.current.repeat = setTimeout(() => {
      const shouldContinue = onStepRef.current();
      if (shouldContinue === false) {
        clear();
        return;
      }
      intervalMsRef.current = Math.max(
        MIN_INTERVAL_MS,
        intervalMsRef.current * ACCELERATION,
      );
      scheduleRepeat();
    }, intervalMsRef.current);
  }, [clear]);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      heldRepeatRef.current = false;
      intervalMsRef.current = START_INTERVAL_MS;
      clear();
      timersRef.current.initial = setTimeout(() => {
        heldRepeatRef.current = true;
        const shouldContinue = onStepRef.current();
        if (shouldContinue === false) {
          clear();
          return;
        }
        scheduleRepeat();
      }, INITIAL_DELAY_MS);
    },
    [disabled, clear, scheduleRepeat],
  );

  const onPointerEnd = useCallback(() => {
    clear();
  }, [clear]);

  const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (heldRepeatRef.current) {
        e.preventDefault();
        heldRepeatRef.current = false;
        return;
      }
      onStepRef.current();
    },
    [disabled],
  );

  return {
    onClick,
    onPointerDown,
    onPointerUp: onPointerEnd,
    onPointerLeave: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}
