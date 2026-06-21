import { motion } from "framer-motion";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { HeaderBar } from "../components/HeaderBar";
import { TaskCard } from "../components/TaskCard";
import { ProgressRing } from "../components/ProgressRing";
import { OrbBackground } from "../components/OrbBackground";
import { captureEvent } from "../lib/posthog";
import { computeFocusSeconds, sortByScheduledTime } from "../lib/day-stats";
import { DAILY_GOAL_MINUTES, useTasks } from "../lib/tasks-context";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 17) return "Boa tarde";
  return "Boa noite";
}

export function DashboardScreen() {
  const history = useHistory();
  const { tasks, changeStatus, editTask, deleteTask } = useTasks();

  const activeTask = tasks.find((t) => t.status === "active");
  const focusSeconds = computeFocusSeconds(tasks);
  const focusMinutes = Math.floor(focusSeconds / 60);
  const goalHours = Math.round(DAILY_GOAL_MINUTES / 60);
  const sessionProgress = activeTask
    ? Math.min((activeTask.elapsed / activeTask.duration) * 100, 100)
    : 0;

  const upcomingTasks = sortByScheduledTime(
    tasks.filter((t) => t.status === "pending"),
  );
  const visibleUpcoming = upcomingTasks.slice(0, 3);
  const completedTasks = tasks.filter((t) => t.status === "completed");

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

        <div className="relative z-10 min-h-screen pb-32">
          <HeaderBar greeting={getGreeting()} userName="Alex" />

          <div className="px-4 space-y-6">
            {/* Active session section */}
            {activeTask && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <div className="card-glass p-5">
                  <div className="flex items-center gap-5">
                    <ProgressRing
                      progress={sessionProgress}
                      size={100}
                      strokeWidth={6}
                    >
                      <p
                        className="m-0 font-display font-bold text-xl text-white leading-none tabular-nums"
                        style={{ fontFamily: "Space Grotesk" }}
                      >
                        {String(
                          Math.floor(
                            Math.max(
                              activeTask.duration - activeTask.elapsed,
                              0,
                            ) / 60,
                          ),
                        ).padStart(2, "0")}
                        :
                        {String(
                          Math.max(
                            activeTask.duration - activeTask.elapsed,
                            0,
                          ) % 60,
                        ).padStart(2, "0")}
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
                      <h2
                        className="font-display font-semibold text-xl text-white mb-1 truncate"
                        style={{ fontFamily: "Space Grotesk" }}
                      >
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
                <h2
                  className="font-display font-semibold text-lg text-white"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Próximas
                </h2>
                <span className="text-obsidian-500 text-sm">
                  {upcomingTasks.length} tarefas
                </span>
              </div>
              {visibleUpcoming.length > 0 ? (
                <div className="space-y-3">
                  {visibleUpcoming.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onStatusChange={changeStatus}
                      onEdit={editTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="card-glass flex flex-col items-center justify-center px-6 py-10 text-center">
                  <p
                    className="font-display font-medium text-base text-white"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
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

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2
                    className="font-display font-semibold text-lg text-white"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    Concluídas
                  </h2>
                  <span className="text-mint-400 text-sm">
                    {completedTasks.length} feitas
                  </span>
                </div>
                <div className="space-y-3 opacity-60">
                  {completedTasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onStatusChange={changeStatus}
                      onEdit={editTask}
                      onDelete={deleteTask}
                    />
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
        </div>
      </IonContent>
    </IonPage>
  );
}
