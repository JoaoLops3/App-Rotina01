import { motion } from 'framer-motion';
import { TaskCard, Task, TaskStatus } from '../components/TaskCard';
import { sortByScheduledTime } from '../lib/day-stats';

interface AgendaScreenProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AgendaScreen({ tasks, onStatusChange, onEdit, onDelete }: AgendaScreenProps) {
  const activeTasks = tasks.filter((t) => t.status === 'active' || t.status === 'paused');
  const upcomingTasks = sortByScheduledTime(tasks.filter((t) => t.status === 'pending'));
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="px-4 pt-12 pb-2 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center justify-between"
      >
        <h1
          className="m-0 font-display font-semibold text-2xl text-white tracking-tight"
          style={{ fontFamily: 'Space Grotesk' }}
        >
          Agenda
        </h1>
        <span className="text-obsidian-500 text-sm">{tasks.length} tarefas</span>
      </motion.div>

      {activeTasks.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Em Andamento
            </h2>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-mint-400" />
          </div>
          <div className="space-y-3">
            {activeTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} isActive={task.status === 'active'} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Próximas
          </h2>
          <span className="text-obsidian-500 text-sm">{upcomingTasks.length} tarefas</span>
        </div>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <p className="text-obsidian-500 text-sm px-1">Nenhuma tarefa pendente.</p>
        )}
      </motion.section>

      {completedTasks.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Concluídas
            </h2>
            <span className="text-mint-400 text-sm">{completedTasks.length} feitas</span>
          </div>
          <div className="space-y-3 opacity-60">
            {completedTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
