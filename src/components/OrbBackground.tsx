import { motion, shouldRenderOrbBackground } from "../lib/motion";

export function OrbBackground() {
  if (!shouldRenderOrbBackground()) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute top-1/3 -left-40 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl"
      />
    </div>
  );
}
