import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  IonPage,
  IonContent,
} from '@ionic/react';
import { HeaderBar } from '../components/HeaderBar';
import { TaskCard, Task, TaskStatus } from '../components/TaskCard';
import { StatsWidget } from '../components/StatsWidget';
import { ProgressRing } from '../components/ProgressRing';
import { CustomTabBar } from '../components/CustomTabBar';
import { NewTaskSheet } from '../components/NewTaskSheet';
import { captureEvent } from '../lib/posthog';
import {
  addMomentum,
  computeFocusSeconds,
  computeGoalPercent,
  formatFocusTime,
  getMomentum,
  sortByScheduledTime,
} from '../lib/day-stats';
import { AgendaScreen } from './AgendaScreen';
import { loadTasks, saveTasks } from '../lib/storage';

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Sessão de Trabalho Profundo',
    category: 'Focus',
    duration: 90,
    elapsed: 42,
    status: 'active',
    priority: 'high',
    scheduledTime: '09:00',
  },
  {
    id: '2',
    title: 'Revisão de Design',
    category: 'Criativo',
    duration: 45,
    elapsed: 45,
    status: 'completed',
    priority: 'medium',
    scheduledTime: '11:00',
  },
  {
    id: '3',
    title: 'Pausa para Meditação',
    category: 'Saúde',
    duration: 15,
    elapsed: 0,
    status: 'pending',
    priority: 'low',
    scheduledTime: '12:30',
  },
  {
    id: '4',
    title: 'Call Estratégico com Equipe',
    category: 'Comunicação',
    duration: 30,
    elapsed: 0,
    status: 'pending',
    priority: 'high',
    scheduledTime: '14:00',
  },
  {
    id: '5',
    title: 'Pesquisa e Aprendizado',
    category: 'Focus',
    duration: 60,
    elapsed: 0,
    status: 'pending',
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Treino na Academia',
    category: 'Saúde',
    duration: 60,
    elapsed: 0,
    status: 'pending',
    priority: 'medium',
    scheduledTime: '18:00',
  },
  {
    id: '7',
    title: 'Planejamento do Dia Seguinte',
    category: 'Focus',
    duration: 20,
    elapsed: 0,
    status: 'pending',
    priority: 'low',
    scheduledTime: '21:00',
  },
];

const dailyGoalMinutes = 300;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 17) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks() ?? sampleTasks);
  const [momentum, setMomentum] = useState(getMomentum);
  const [activeTab, setActiveTab] = useState('home');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const statsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const activeTask = tasks.find((t) => t.status === 'active');
  const focusSeconds = computeFocusSeconds(tasks);
  const focusMinutes = Math.floor(focusSeconds / 60);
  const dailyGoal = dailyGoalMinutes;
  const sessionProgress = activeTask
    ? Math.min((activeTask.elapsed / activeTask.duration) * 100, 100)
    : 0;
  const completedRecordedRef = useRef<Set<string>>(
    new Set(sampleTasks.filter((t) => t.status === 'completed').map((t) => t.id))
  );

  const scrollToStats = () => {
    setActiveTab('stats');
    requestAnimationFrame(() => {
      statsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      statsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!activeTask) return;

    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === activeTask.id && task.status === 'active' && task.elapsed < task.duration) {
            const nextElapsed = task.elapsed + 1;
            if (nextElapsed >= task.duration) {
              return { ...task, elapsed: task.duration, status: 'completed' as TaskStatus };
            }
            return { ...task, elapsed: nextElapsed };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  useEffect(() => {
    tasks.forEach((task) => {
      if (task.status === 'completed' && !completedRecordedRef.current.has(task.id)) {
        completedRecordedRef.current.add(task.id);
        setMomentum(addMomentum());
        captureEvent('task completed', {
          task_id: task.id,
          task_title: task.title,
          task_category: task.category,
          task_priority: task.priority,
          task_duration_minutes: Math.floor(task.duration / 60),
          task_elapsed_minutes: Math.floor(task.elapsed / 60),
          completion_rate: Math.round((task.elapsed / task.duration) * 100),
        });
      }
    });
  }, [tasks]);

  const handleCreateTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    captureEvent('task created', {
      task_id: task.id,
      task_title: task.title,
      task_category: task.category,
      task_priority: task.priority,
      task_duration_minutes: Math.floor(task.duration / 60),
      has_scheduled_time: Boolean(task.scheduledTime),
    });
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      );
      if (newStatus === 'active') {
        return updated.map((task) =>
          task.id === id ? task :
          task.status === 'active' ? { ...task, status: 'paused' } : task
        );
      }
      return updated;
    });
  };

  const upcomingTasks = sortByScheduledTime(tasks.filter((t) => t.status === 'pending'));
  const visibleUpcoming = upcomingTasks.slice(0, 3);
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const focusPercent = computeGoalPercent(focusMinutes, dailyGoal);
  const goalHours = Math.round(dailyGoal / 60);
  const remainingTasks = tasks.length - completedTasks.length;
  const tasksPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const handleViewStats = () => {
    captureEvent('stats viewed', {
      focus_minutes: focusMinutes,
      tasks_completed: completedTasks.length,
      total_tasks: tasks.length,
      momentum,
    });
    scrollToStats();
  };

  const handleViewAllTasks = () => {
    captureEvent('view all tasks tapped', {
      upcoming_tasks: upcomingTasks.length,
      total_tasks: tasks.length,
    });
    setActiveTab('schedule');
  };

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-content-custom">
        {/* Gradient orb background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            className="absolute top-1/3 -left-40 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 min-h-screen pb-32">
          {activeTab === 'schedule' ? (
            <AgendaScreen tasks={tasks} onStatusChange={handleStatusChange} />
          ) : (
          <>
          <HeaderBar greeting={getGreeting()} userName="Alex" />

          <div className="px-4 space-y-6">
            {/* Active session section */}
            {activeTask && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                <div className="card-glass p-5">
                  <div className="flex items-center gap-5">
                    <ProgressRing progress={sessionProgress} size={100} strokeWidth={6}>
                      <p
                        className="m-0 font-display font-bold text-xl text-white leading-none tabular-nums"
                        style={{ fontFamily: 'Space Grotesk' }}
                      >
                        {String(Math.floor(Math.max(activeTask.duration - activeTask.elapsed, 0) / 60)).padStart(2, '0')}
                        :
                        {String(Math.max(activeTask.duration - activeTask.elapsed, 0) % 60).padStart(2, '0')}
                      </p>
                      <p className="m-0 mt-0.5 text-[8px] text-obsidian-500 uppercase tracking-wide leading-none whitespace-nowrap">
                        restando
                      </p>
                    </ProgressRing>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.span
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-mint-400"
                        />
                        <span className="text-xs text-mint-400 font-semibold uppercase tracking-wider">
                          Em Andamento
                        </span>
                      </div>
                      <h2 className="font-display font-semibold text-xl text-white mb-1 truncate" style={{ fontFamily: 'Space Grotesk' }}>
                        {activeTask.title}
                      </h2>
                      <p className="text-sm text-obsidian-400 mb-3">
                        Foco hoje: {focusMinutes}m / {goalHours}h
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeTask.id, 'paused')}
                          className="px-4 py-1.5 rounded-xl text-sm font-medium text-mint-400 bg-mint-500/10 border border-mint-500/30 hover:bg-mint-500/20 transition-colors touch-manipulation"
                        >
                          Pausar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeTask.id, 'completed')}
                          className="px-4 py-1.5 rounded-xl text-sm font-medium text-obsidian-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors touch-manipulation"
                        >
                          Encerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Stats overview */}
            <motion.section
              ref={statsSectionRef}
              id="stats-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4"
            >
              <StatsWidget
                stats={{
                  focusValue: formatFocusTime(focusMinutes),
                  focusGoalLabel: `${focusPercent}% da meta de ${goalHours}h`,
                  focusProgress: focusPercent,
                  tasksValue: `${completedTasks.length} / ${tasks.length}`,
                  tasksRemainingLabel: `${remainingTasks} ${remainingTasks === 1 ? 'restante' : 'restantes'} hoje`,
                  tasksProgress: tasksPercent,
                  momentum,
                }}
                onViewStats={handleViewStats}
              />
            </motion.section>

            {/* Upcoming tasks */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Próximas
                </h2>
                <span className="text-obsidian-500 text-sm">{upcomingTasks.length} tarefas</span>
              </div>
              <div className="space-y-3">
                {visibleUpcoming.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} onStatusChange={handleStatusChange} />
                ))}
              </div>
              <button
                type="button"
                onClick={handleViewAllTasks}
                className="mt-3 w-full py-3 rounded-2xl text-sm font-medium text-mint-400 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors touch-manipulation"
              >
                Ver todas
              </button>
            </motion.section>

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Concluídas
                  </h2>
                  <span className="text-mint-400 text-sm">{completedTasks.length} feitas</span>
                </div>
                <div className="space-y-3 opacity-60">
                  {completedTasks.map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} onStatusChange={handleStatusChange} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleViewAllTasks}
                  className="mt-3 w-full py-3 rounded-2xl text-sm font-medium text-mint-400 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors touch-manipulation"
                >
                  Ver todas
                </button>
              </motion.section>
            )}

          </div>
          </>
          )}
        </div>

        {/* Custom Tab Bar */}
        <CustomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCenterClick={() => setIsNewTaskOpen(true)}
        />

        <NewTaskSheet
          isOpen={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          onCreate={handleCreateTask}
        />
      </IonContent>
    </IonPage>
  );
}
