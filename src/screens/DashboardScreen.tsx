import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IonPage,
  IonContent,
} from '@ionic/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeaderBar } from '../components/HeaderBar';
import { TaskCard, Task, TaskStatus } from '../components/TaskCard';
import { StatsWidget } from '../components/StatsWidget';
import { ProgressRing } from '../components/ProgressRing';
import { CustomTabBar } from '../components/CustomTabBar';

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
];

const todayFocus = 222;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 17) return 'Boa tarde';
  return 'Boa noite';
}

function formatFocusTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [focusMinutes] = useState(todayFocus);
  const [activeTab, setActiveTab] = useState('home');

  const activeTask = tasks.find((t) => t.status === 'active');
  const dailyGoal = 300;
  const progressPercent = Math.min((focusMinutes / dailyGoal) * 100, 100);

  useEffect(() => {
    if (!activeTask) return;

    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === activeTask.id && task.elapsed < task.duration) {
            return { ...task, elapsed: task.elapsed + 1 };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );

    if (newStatus === 'active') {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status: 'active' } :
          task.status === 'active' ? { ...task, status: 'paused' } : task
        )
      );
    }
  };

  const upcomingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

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
          <HeaderBar greeting={getGreeting()} userName="Alex" />

          <div className="px-4 space-y-6">
            {/* Active session section */}
            {activeTask && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                <div className="card-glass p-5">
                  <div className="flex items-center gap-5">
                    <ProgressRing progress={progressPercent} size={100} strokeWidth={6}>
                      <div className="text-center">
                        <p className="font-display font-bold text-2xl text-white" style={{ fontFamily: 'Space Grotesk' }}>
                          {Math.floor((activeTask.duration - activeTask.elapsed) / 60)}
                        </p>
                        <p className="text-[10px] text-obsidian-500 uppercase tracking-wider">min restantes</p>
                      </div>
                    </ProgressRing>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-mint-400" />
                        <span className="text-xs text-mint-400 font-medium uppercase tracking-wider">
                          Sessão Ativa
                        </span>
                      </div>
                      <h2 className="font-display font-semibold text-xl text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                        {activeTask.title}
                      </h2>
                      <p className="text-sm text-obsidian-400">
                        Foco hoje: {formatFocusTime(focusMinutes)} / {formatFocusTime(dailyGoal)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Stats overview */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Estatísticas do Dia
                </h2>
                <motion.button whileHover={{ x: 2 }} className="text-obsidian-400 flex items-center gap-1 text-sm hover:text-obsidian-300 transition-colors">
                  Ver Tudo
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
              <StatsWidget
                stats={{
                  focusTime: formatFocusTime(focusMinutes),
                  focusTrend: '+23%',
                  tasksCompleted: `${completedTasks.length}/${tasks.length}`,
                  streak: 12,
                  efficiency: '87%',
                }}
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
                {upcomingTasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} onStatusChange={handleStatusChange} />
                ))}
              </div>
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
              </motion.section>
            )}

            {/* Active task card */}
            {activeTask && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-display font-semibold text-lg text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Em Andamento
                  </h2>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-mint-400" />
                </div>
                <TaskCard task={activeTask} index={0} isActive onStatusChange={handleStatusChange} />
              </motion.section>
            )}
          </div>
        </div>

        {/* Custom Tab Bar */}
        <CustomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </IonContent>
    </IonPage>
  );
}
