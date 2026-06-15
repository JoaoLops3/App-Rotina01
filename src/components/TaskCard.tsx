import { motion } from 'framer-motion';
import { Check, Clock, MoreVertical, RotateCcw, Zap } from 'lucide-react';

export type TaskStatus = 'active' | 'pending' | 'paused' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category: string;
  duration: number;
  elapsed: number;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledTime?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  isActive?: boolean;
  onStatusChange?: (id: string, status: TaskStatus) => void;
}

const categoryColors: Record<string, string> = {
  'Focus': 'bg-electric-500/20 text-electric-400',
  'Criativo': 'bg-coral-500/20 text-coral-400',
  'Saúde': 'bg-mint-500/20 text-mint-400',
  'Comunicação': 'bg-obsidian-400/20 text-obsidian-300',
  'Default': 'bg-obsidian-500/20 text-obsidian-300',
};

export function TaskCard({ task, index, isActive = false, onStatusChange }: TaskCardProps) {
  const progress = (task.elapsed / task.duration) * 100;
  const remainingTime = task.duration - task.elapsed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`relative overflow-hidden ${isActive ? 'card-glass' : 'card-premium'} p-5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] touch-manipulation`}
    >
      {isActive && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-mint-400 to-mint-500 origin-top"
          style={{ boxShadow: '0 0 20px rgba(52, 211, 153, 0.5)' }}
        />
      )}

      {isActive && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-mint-500/60 to-mint-400/60 origin-left"
        />
      )}

      <div className="flex items-start gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onStatusChange?.(task.id, task.status === 'active' ? 'paused' : 'active')}
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${isActive ? 'bg-mint-500/20' : 'bg-surface-tertiary hover:bg-surface-elevated'}`}
          style={isActive ? { boxShadow: '0 0 20px rgba(52, 211, 153, 0.15)' } : {}}
        >
          {task.status === 'active' ? (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="w-5 h-5 text-mint-400" strokeWidth={2} />
            </motion.div>
          ) : task.status === 'paused' ? (
            <RotateCcw className="w-5 h-5 text-obsidian-400" strokeWidth={1.5} />
          ) : (
            <Check className="w-5 h-5 text-obsidian-400" strokeWidth={2} />
          )}

          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-mint-400/30"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`tiny px-2 py-0.5 rounded-lg text-xs font-medium ${categoryColors[task.category] || categoryColors['Default']}`}>
              {task.category}
            </span>
            {task.scheduledTime && (
              <span className="text-xs text-obsidian-500 flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {task.scheduledTime}
              </span>
            )}
          </div>

          <h3 className={`font-display font-medium text-lg leading-tight tracking-tight mb-1 ${isActive ? 'text-white' : 'text-obsidian-200'}`} style={{ fontFamily: 'Space Grotesk' }}>
            {task.title}
          </h3>

          {isActive && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <span className="font-display font-semibold text-mint-400 text-2xl tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
                {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:{String(remainingTime % 60).padStart(2, '0')}
              </span>
              <span className="text-obsidian-500 text-sm">restantes</span>
            </motion.div>
          )}

          {!isActive && (
            <div className="flex items-center gap-2">
              <span className="text-obsidian-400 text-sm">
                {Math.floor(task.duration / 60)} min
              </span>
              {task.status === 'completed' && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs text-mint-400 bg-mint-400/10 px-2 py-0.5 rounded-md">
                  Concluído
                </motion.span>
              )}
            </div>
          )}
        </div>

        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-obsidian-500 hover:text-obsidian-300 transition-colors">
          <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}
