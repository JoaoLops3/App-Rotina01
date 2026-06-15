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
}

function StatCard({ icon: Icon, label, value, trend, trendUp = true, delay = 0, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="card-glass p-4 flex-shrink-0 w-[140px] hover:bg-white/[0.04] transition-colors cursor-default"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${gradient || 'bg-surface-tertiary'}`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>

      <p className="text-obsidian-500 text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </p>

      <p className="font-display font-semibold text-xl text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
        {value}
      </p>

      {trend && (
        <p className={`text-xs ${trendUp ? 'text-mint-400' : 'text-coral-400'} flex items-center gap-1`}>
          <TrendingUp className={`w-3 h-3 ${trendUp ? '' : 'rotate-180'}`} />
          {trend}
        </p>
      )}
    </motion.div>
  );
}

interface StatsWidgetProps {
  stats: {
    focusTime: string;
    focusTrend: string;
    tasksCompleted: string;
    streak: number;
    efficiency: string;
  };
}

export function StatsWidget({ stats }: StatsWidgetProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <StatCard
        icon={Clock}
        label="Focus Time"
        value={stats.focusTime}
        trend={stats.focusTrend}
        trendUp={true}
        delay={0}
        gradient="bg-gradient-to-br from-mint-500/30 to-mint-600/20"
      />
      <StatCard
        icon={Target}
        label="Completed"
        value={stats.tasksCompleted}
        delay={0.1}
        gradient="bg-gradient-to-br from-electric-500/30 to-electric-600/20"
      />
      <StatCard
        icon={Flame}
        label="Streak"
        value={`${stats.streak} days`}
        delay={0.2}
        gradient="bg-gradient-to-br from-coral-500/30 to-coral-600/20"
      />
    </div>
  );
}
