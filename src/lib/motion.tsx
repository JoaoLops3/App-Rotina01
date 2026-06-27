import { Capacitor } from "@capacitor/core";
import {
  AnimatePresence,
  LazyMotion,
  domMax,
  m,
  useReducedMotion,
} from "framer-motion";

const loadFeatures = () => Promise.resolve(domMax);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}

/** Alias de `m` para uso com LazyMotion (carrega domMax sob demanda). */
export const motion = m;

export { AnimatePresence, useReducedMotion };

export function shouldRenderOrbBackground(): boolean {
  if (typeof window === "undefined") return false;
  if (Capacitor.isNativePlatform()) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
