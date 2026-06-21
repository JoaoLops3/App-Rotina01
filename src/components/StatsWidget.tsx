import { motion } from 'framer-motion';
import { Flame, Clock, ListChecks } from 'lucide-react';

export interface StatsWidgetData {
  focusValue: string;
  focusGoalLabel: string;
  focusProgress: number;
  tasksValue: string;
  tasksRemainingLabel: string;
  tasksProgress: number;
  streakValue: string;
  streakLabel: string;
}

interface StatsWidgetProps {
  stats: StatsWidgetData;
  onViewStats?: () => void;
}

const cardTransition = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function StatsWidget({ stats, onViewStats }: StatsWidgetProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...cardTransition, delay: 0 }}
          onClick={onViewStats}
          className="card-glass p-4 text-left flex flex-col hover:bg-white/[0.04] transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-mint-500/30 to-mint-600/20">
              <Clock className="w-4 h-4 text-mint-400" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-obsidian-500 text-[10px] font-medium uppercase tracking-wider leading-tight truncate">
                Foco Hoje
              </p>
              <p className="font-display font-bold text-2xl text-white leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                {stats.focusValue}
              </p>
            </div>
          </div>

          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full bg-mint-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.focusProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <p className="text-obsidian-500 text-xs truncate">{stats.focusGoalLabel}</p>
        </motion.button>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...cardTransition, delay: 0.05 }}
          onClick={onViewStats}
          className="card-glass p-4 text-left flex flex-col hover:bg-white/[0.04] transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-electric-500/30 to-electric-600/20">
              <ListChecks className="w-4 h-4 text-electric-400" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-obsidian-500 text-[10px] font-medium uppercase tracking-wider leading-tight truncate">
                Tarefas
              </p>
              <p className="font-display font-bold text-2xl text-white leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                {stats.tasksValue}
              </p>
            </div>
          </div>

          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full bg-electric-500"
              initial={{ width: 0 }}
              animate={{ width: `${stats.tasksProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
            />
          </div>
          <p className="text-obsidian-500 text-xs truncate">{stats.tasksRemainingLabel}</p>
        </motion.button>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...cardTransition, delay: 0.1 }}
        onClick={onViewStats}
        className="card-glass p-4 w-full text-left hover:bg-white/[0.04] transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-coral-500/30 to-coral-600/20">
            <Flame className="w-4 h-4 text-coral-400" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-obsidian-500 text-[10px] font-medium uppercase tracking-wider leading-tight truncate">
              Sequência
            </p>
            <p className="font-display font-bold text-2xl text-white leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
              {stats.streakValue}
            </p>
          </div>
        </div>
        <p className="text-obsidian-500 text-xs leading-relaxed mt-3">
          {stats.streakLabel}
        </p>
      </motion.button>
    </div>
  );
}
