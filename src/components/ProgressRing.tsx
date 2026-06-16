import { motion } from 'framer-motion';

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
  className = '',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="fill-none stroke-surface-tertiary"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        <motion.circle
          className="progress-ring-circle fill-none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="url(#progressGradient)"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: 'drop-shadow(0 0 8px rgba(110, 231, 183, 0.4))',
          }}
        />

        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="absolute flex flex-col items-center justify-center overflow-hidden text-center"
        style={{
          top: strokeWidth + 6,
          right: strokeWidth + 6,
          bottom: strokeWidth + 6,
          left: strokeWidth + 6,
        }}
      >
        {children}
      </div>
    </div>
  );
}
