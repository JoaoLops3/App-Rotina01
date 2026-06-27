import { useId } from "react";
import { motion } from "../lib/motion";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className = "",
  children,
}: ProgressRingProps) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `progressGradient-${uid}`;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg
        width={size}
        height={size}
        className="progress-ring block overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <circle
          className="fill-none stroke-surface-tertiary"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Halo suave sem filter CSS/SVG — evita o artefato de quadrado no fundo */}
        <motion.circle
          className="progress-ring-circle fill-none"
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          opacity={0.2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />

        <motion.circle
          className="progress-ring-circle fill-none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        style={{ padding: strokeWidth + 6 }}
      >
        {children}
      </div>
    </div>
  );
}
