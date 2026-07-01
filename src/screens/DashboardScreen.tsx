import { useEffect, useMemo, useRef } from "react";
import { motion } from "../lib/motion";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { HeaderBar } from "../components/HeaderBar";
import { TaskCard } from "../components/TaskCard";
import { ProgressRing } from "../components/ProgressRing";
import { OrbBackground } from "../components/OrbBackground";
import { captureEvent } from "../lib/posthog";
import { computeFocusSeconds, sortByScheduledTime } from "../lib/day-stats";
import { useDailyGoal } from "../lib/use-daily-goal";
import { useActiveElapsed, useTasks } from "../lib/tasks-context";
import { useProfile } from "../lib/profile-context";
import { getShownName } from "../lib/profile-storage";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 17) return "Boa tarde";
  return "Boa noite";
}

export function DashboardScreen() {
  const history = useHistory();
  const location = useLocation();
  const { tasks, changeStatus, editTask, deleteTask } = useTasks();
  const { profile } = useProfile();
  const taskRefs = useRef<Record<string, HTMLElement | null>>({});

  const highlightTaskId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("highlightTask");
  }, [location.search]);

  useEffect(() => {
    if (!highlightTaskId) return;
    const element = taskRefs.current[highlightTaskId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const timeout = setTimeout(() => {
      history.replace("/");
    }, 4000);
    return () => clearTimeout(timeout);
  }, [highlightTaskId, history, tasks]);

  const renderTaskCard = (
    task: (typeof tasks)[number],
    index: number,
    isActive = false,
  ) => (
    <div
      key={task.id}
      ref={(el) => {
        taskRefs.current[task.id] = el;
      }}
    >
      <TaskCard
        task={task}
        index={index}
        isActive={isActive}
        highlighted={highlightTaskId === task.id}
        onStatusChange={changeStatus}
        onEdit={editTask}
        onDelete={deleteTask}
      />
    </div>
  );

  const activeTask = tasks.find((t) => t.status === "active");
  const liveElapsed = useActiveElapsed(activeTask);
  const focusSeconds = activeTask
    ? computeFocusSeconds(tasks) - activeTask.elapsed + liveElapsed
    : computeFocusSeconds(tasks);
  const focusMinutes = Math.floor(focusSeconds / 60);
  const dailyGoalMinutes = useDailyGoal();
  const goalHours = Math.round(dailyGoalMinutes / 60);
  const sessionProgress = activeTask
    ? Math.min((liveElapsed / activeTask.duration) * 100, 100)
    : 0;
  const sessionRemaining = activeTask
    ? Math.max(activeTask.duration - liveElapsed, 0)
    : 0;

  const upcomingTasks = sortByScheduledTime(
    tasks.filter((t) => t.status === "pending"),
  );
  const visibleUpcoming = upcomingTasks.slice(0, 3);

  const handleViewAllTasks = () => {
    captureEvent("view all tasks tapped", {
      upcoming_tasks: upcomingTasks.length,
      total_tasks: tasks.length,
    });
    history.push("/agenda");
  };

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-content-custom">
        <OrbBackground />

        <div className="relative z-10 min-h-screen pb-32 md:mx-auto md:max-w-xl">
          <HeaderBar
            greeting={getGreeting()}
            userName={getShownName(profile)}
            avatarSeed={profile.avatarSeed}
            avatarStyle={profile.avatarStyle}
          />

          <div className="px-4 space-y-6">
            {/* Active session section */}
            {activeTask && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
                ref={(el) => {
                  taskRefs.current[activeTask.id] = el;
                }}
              >
                <div
                  className={`card-glass p-5 ${
                    highlightTaskId === activeTask.id
                      ? "ring-2 ring-mint-400/60 ring-offset-2 ring-offset-surface-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <ProgressRing
                      progress={sessionProgress}
                      size={100}
                      strokeWidth={6}
                    >
                      <p className="m-0 font-display font-bold text-xl text-white leading-none tabular-nums">
                        {String(Math.floor(sessionRemaining / 60)).padStart(
                          2,
                          "0",
                        )}
                        :{String(sessionRemaining % 60).padStart(2, "0")}
                      </p>
                      <p className="m-0 mt-0.5 text-[8px] text-obsidian-500 uppercase tracking-wide leading-none whitespace-nowrap">
                        restando
                      </p>
                    </ProgressRing>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.span
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.6, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-mint-400"
                        />
                        <span className="text-xs text-mint-400 font-semibold uppercase tracking-wider">
                          Em Andamento
                        </span>
                      </div>
                      <h2 className="font-display font-semibold text-xl text-white mb-1 truncate">
                        {activeTask.title}
                      </h2>
                      <p className="text-sm text-obsidian-400 mb-3">
                        Foco hoje: {focusMinutes}m / {goalHours}h
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeStatus(activeTask.id, "paused")}
                          className="px-4 py-1.5 rounded-xl text-sm font-medium text-mint-400 bg-mint-500/10 border border-mint-500/30 hover:bg-mint-500/20 transition-colors touch-manipulation"
                        >
                          Pausar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            changeStatus(activeTask.id, "completed")
                          }
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

            {/* Upcoming tasks */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-display font-semibold text-lg text-white">
                  Próximas
                </h2>
                <span className="text-obsidian-500 text-sm">
                  {upcomingTasks.length} tarefas
                </span>
              </div>
              {visibleUpcoming.length > 0 ? (
                <div className="space-y-3">
                  {visibleUpcoming.map((task, index) =>
                    renderTaskCard(task, index),
                  )}
                </div>
              ) : (
                <div className="card-glass flex flex-col items-center justify-center px-6 py-10 text-center">
                  <p className="font-display font-medium text-base text-white">
                    Nenhuma tarefa no momento
                  </p>
                  <p className="text-obsidian-500 text-sm mt-1">
                    Toque no + para criar sua primeira tarefa.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handleViewAllTasks}
                className="mt-3 w-full py-3 rounded-2xl text-sm font-medium text-mint-400 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors touch-manipulation"
              >
                Ver todas
              </button>
            </motion.section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
