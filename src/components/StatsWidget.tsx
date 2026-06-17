import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Clock } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  gradient?: string;
  onClick?: () => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp = true,
  delay = 0,
  gradient,
  onClick,
}: StatCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className="card-glass p-3 flex-1 min-w-0 flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors touch-manipulation"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${gradient || 'bg-surface-tertiary'}`}>
        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
      </div>

      <p className="text-obsidian-500 text-[10px] font-medium uppercase tracking-wider mb-0.5 leading-tight w-full truncate">
        {label}
      </p>

      <p className="font-display font-semibold text-base text-white leading-tight w-full truncate" style={{ fontFamily: 'Space Grotesk' }}>
        {value}
      </p>

      {trend && (
        <p className={`text-[10px] mt-1 ${trendUp ? 'text-mint-400' : 'text-coral-400'} flex items-center justify-center gap-0.5 w-full truncate`}>
          <TrendingUp className={`w-2.5 h-2.5 ${trendUp ? '' : 'rotate-180'}`} />
          {trend}
        </p>
      )}
    </motion.button>
  );
}

export interface StatsWidgetData {
  focusTime: string;
  focusTrend: string;
  tasksCompleted: string;
  momentum: number;
}

interface StatsWidgetProps {
  stats: StatsWidgetData;
  onViewStats?: () => void;
}

export function StatsWidget({ stats, onViewStats }: StatsWidgetProps) {
  return (
    <div className="flex w-full gap-2">
      <StatCard
        icon={Clock}
        label="Foco"
        value={stats.focusTime}
        trend={stats.focusTrend}
        trendUp={true}
        delay={0}
        gradient="bg-gradient-to-br from-mint-500/30 to-mint-600/20"
        onClick={onViewStats}
      />
      <StatCard
        icon={Target}
        label="Feitas"
        value={stats.tasksCompleted}
        delay={0.05}
        gradient="bg-gradient-to-br from-electric-500/30 to-electric-600/20"
        onClick={onViewStats}
      />
      <StatCard
        icon={Flame}
        label="Momentum"
        value={String(stats.momentum)}
        delay={0.1}
        gradient="bg-gradient-to-br from-coral-500/30 to-coral-600/20"
        onClick={onViewStats}
      />
    </div>
  );
}
