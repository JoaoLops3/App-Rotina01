import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flame,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { AppNotification, NotificationType } from "../types/notification";

interface TypeStyle {
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
}

const typeStyles: Record<NotificationType, TypeStyle> = {
  task_upcoming: {
    icon: Clock,
    iconClass: "text-mint-400",
    bgClass: "bg-mint-500/15",
  },
  task_completed: {
    icon: CheckCircle,
    iconClass: "text-mint-400",
    bgClass: "bg-mint-500/15",
  },
  daily_goal_reached: {
    icon: Target,
    iconClass: "text-electric-400",
    bgClass: "bg-electric-500/15",
  },
  streak_milestone: {
    icon: Flame,
    iconClass: "text-coral-400",
    bgClass: "bg-coral-500/15",
  },
  streak_at_risk: {
    icon: AlertTriangle,
    iconClass: "text-coral-400",
    bgClass: "bg-coral-500/15",
  },
  task_overdue: {
    icon: AlertCircle,
    iconClass: "text-coral-400",
    bgClass: "bg-coral-500/15",
  },
  timer_finished: {
    icon: Timer,
    iconClass: "text-mint-400",
    bgClass: "bg-mint-500/15",
  },
};

function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24 && now.getDate() === then.getDate()) {
    return `há ${diffHours}h`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (then.getDate() === yesterday.getDate() && diffHours < 48) {
    return "ontem";
  }

  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
}

interface NotificationCardProps {
  notification: AppNotification;
  index: number;
  onClick: (notification: AppNotification) => void;
}

export function NotificationCard({
  notification,
  index,
  onClick,
}: NotificationCardProps) {
  const { icon: Icon, iconClass, bgClass } = typeStyles[notification.type];

  return (
    <motion.button
      type="button"
      onClick={() => onClick(notification)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      whileTap={{ scale: 0.98 }}
      className={`card-glass flex w-full items-start gap-3 p-4 text-left transition-colors touch-manipulation ${
        notification.read ? "" : "bg-white/[0.04]"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${bgClass}`}
      >
        <Icon className={`h-5 w-5 ${iconClass}`} strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 truncate text-sm font-semibold text-white">
            {notification.title}
          </p>
          <span className="shrink-0 text-[11px] text-obsidian-500">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 mb-0 text-xs leading-relaxed text-obsidian-300">
          {notification.body}
        </p>
      </div>

      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral-400" />
      )}
    </motion.button>
  );
}
