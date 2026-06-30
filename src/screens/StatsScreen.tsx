import { useEffect } from "react";
import { motion } from "../lib/motion";
import { IonPage, IonContent } from "@ionic/react";
import { StatsWidget } from "../components/StatsWidget";
import { TrainStreakCard } from "../components/TrainStreakCard";
import { OrbBackground } from "../components/OrbBackground";
import { captureEvent } from "../lib/posthog";
import {
  computeFocusSeconds,
  computeGoalPercent,
  computeRecordStreak,
  computeWeekDots,
  dayKey,
  formatFocusTime,
  loadHistory,
  type DayStat,
} from "../lib/day-stats";
import { DAILY_GOAL_MINUTES, useTasks } from "../lib/tasks-context";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function lastSevenDays(history: DayStat[]): DayStat[] {
  const byDate = new Map(history.map((d) => [d.date, d]));
  const days: DayStat[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i += 1) {
    const key = dayKey(cursor);
    days.push(
      byDate.get(key) ?? { date: key, tasksCompleted: 0, focusSeconds: 0 },
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function StatsScreen() {
  const { tasks, streak } = useTasks();

  const focusSeconds = computeFocusSeconds(tasks);
  const focusMinutes = Math.floor(focusSeconds / 60);
  const dailyGoal = DAILY_GOAL_MINUTES;
  const goalHours = Math.round(dailyGoal / 60);
  const focusPercent = computeGoalPercent(focusMinutes, dailyGoal);

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const remainingTasks = tasks.length - completedTasks.length;
  const tasksPercent =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const week = lastSevenDays(loadHistory());
  const maxFocus = Math.max(...week.map((d) => d.focusSeconds), 1);
  const todayKey = dayKey();
  const history = loadHistory();
  const recordDays = computeRecordStreak(history);
  const weekDots = computeWeekDots(history, tasks);

  useEffect(() => {
    captureEvent("stats viewed", {
      focus_minutes: focusMinutes,
      tasks_completed: completedTasks.length,
      total_tasks: tasks.length,
      streak_days: streak,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-content-custom">
        <OrbBackground />

        <div className="relative z-10 min-h-screen pb-32 md:mx-auto md:max-w-xl">
          <div className="px-4 pt-safe pb-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="m-0 font-display font-semibold text-2xl text-white tracking-tight">
                Estatísticas
              </h1>
              <p className="text-obsidian-500 text-sm mt-1">
                Seu progresso de hoje e dos últimos dias.
              </p>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <StatsWidget
                stats={{
                  focusValue: formatFocusTime(focusMinutes),
                  focusGoalLabel: `${focusPercent}% da meta de ${goalHours}h`,
                  focusProgress: focusPercent,
                  tasksValue: `${completedTasks.length} / ${tasks.length}`,
                  tasksRemainingLabel: `${remainingTasks} ${remainingTasks === 1 ? "restante" : "restantes"} hoje`,
                  tasksProgress: tasksPercent,
                }}
              />
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <TrainStreakCard
                streakDays={streak}
                recordDays={recordDays}
                weekDots={weekDots}
              />
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glass p-5"
            >
              <h2 className="font-display font-semibold text-lg text-white mb-4">
                Foco nos últimos 7 dias
              </h2>
              <div className="flex items-end justify-between gap-2 h-36">
                {week.map((day) => {
                  const heightPct = Math.round(
                    (day.focusSeconds / maxFocus) * 100,
                  );
                  const isToday = day.date === todayKey;
                  const weekday =
                    WEEKDAY_LABELS[new Date(`${day.date}T00:00:00`).getDay()];
                  const minutes = Math.floor(day.focusSeconds / 60);
                  return (
                    <div
                      key={day.date}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex w-full flex-1 items-end justify-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(heightPct, 4)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`w-full max-w-[28px] rounded-t-lg ${
                            isToday
                              ? "bg-gradient-to-t from-mint-500 to-mint-400"
                              : "bg-white/10"
                          }`}
                          title={`${minutes} min`}
                        />
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wide ${
                          isToday ? "text-mint-400" : "text-obsidian-500"
                        }`}
                      >
                        {weekday}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
