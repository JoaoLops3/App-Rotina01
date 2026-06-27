import { useEffect, useMemo } from "react";
import { motion } from "../lib/motion";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { Bell, ChevronLeft, CheckCheck, Settings } from "lucide-react";
import { OrbBackground } from "../components/OrbBackground";
import { NotificationCard } from "../components/NotificationCard";
import { useNotifications } from "../lib/notifications-context";
import { getNotificationNavigationTarget } from "../lib/notification-deeplink";
import { dayKey } from "../lib/day-stats";
import { captureEvent } from "../lib/posthog";
import {
  tabNavigationState,
  type TabNavigationState,
} from "../lib/tab-navigation";
import type { AppNotification } from "../types/notification";

interface Group {
  label: string;
  items: AppNotification[];
}

function groupByDay(notifications: AppNotification[]): Group[] {
  const today = dayKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);

  const buckets: Record<string, AppNotification[]> = {
    Hoje: [],
    Ontem: [],
    Anteriores: [],
  };

  notifications.forEach((n) => {
    const key = dayKey(new Date(n.createdAt));
    if (key === today) buckets.Hoje.push(n);
    else if (key === yesterday) buckets.Ontem.push(n);
    else buckets.Anteriores.push(n);
  });

  return (["Hoje", "Ontem", "Anteriores"] as const)
    .map((label) => ({ label, items: buckets[label] }))
    .filter((group) => group.items.length > 0);
}

export function NotificationsScreen() {
  const history = useHistory();
  const location = useLocation();
  const tabState = location.state as TabNavigationState | undefined;
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    const target = getNotificationNavigationTarget(
      notification.type,
      notification.taskId,
    );
    history.push({
      pathname: target.pathname,
      search: target.search,
    });
  };

  const groups = useMemo(() => groupByDay(notifications), [notifications]);

  useEffect(() => {
    captureEvent("notifications viewed", {
      total: notifications.length,
      unread: unreadCount,
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
              <div className="flex items-center justify-between">
                <motion.button
                  type="button"
                  onClick={() => history.goBack()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-secondary text-obsidian-200 transition-colors hover:bg-surface-tertiary touch-manipulation"
                  aria-label="Voltar"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </motion.button>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() =>
                      history.push(
                        "/notificacoes/preferencias",
                        tabNavigationState(tabState?.activeTab ?? "home"),
                      )
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-secondary text-obsidian-200 transition-colors hover:bg-surface-tertiary touch-manipulation"
                    aria-label="Preferências de notificações"
                  >
                    <Settings className="h-5 w-5" strokeWidth={1.5} />
                  </motion.button>

                  {unreadCount > 0 && (
                    <motion.button
                      type="button"
                      onClick={markAllAsRead}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-1.5 rounded-2xl border border-mint-500/20 bg-mint-500/10 px-3.5 py-2 text-xs font-medium text-mint-400 transition-colors hover:bg-mint-500/20 touch-manipulation"
                    >
                      <CheckCheck className="h-4 w-4" strokeWidth={2} />
                      Marcar todas como lidas
                    </motion.button>
                  )}
                </div>
              </div>

              <h1
                className="mt-3 mb-0 font-display font-semibold text-2xl text-white tracking-tight"
                style={{ fontFamily: "Space Grotesk" }}
              >
                Notificações
              </h1>
              <p className="text-obsidian-500 text-sm mt-1">
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? "nova notificação" : "novas notificações"}.`
                  : "Lembretes, conquistas e alertas da sua rotina."}
              </p>
            </motion.div>

            {groups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card-glass flex flex-col items-center gap-3 px-6 py-12 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/[0.04]">
                  <Bell
                    className="h-6 w-6 text-obsidian-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="m-0 text-sm font-medium text-obsidian-200">
                  Nenhuma notificação por enquanto
                </p>
                <p className="m-0 text-xs text-obsidian-500">
                  Lembretes de tarefas e conquistas aparecem aqui.
                </p>
              </motion.div>
            ) : (
              groups.map((group, groupIndex) => (
                <motion.section
                  key={group.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + groupIndex * 0.05 }}
                  className="space-y-2"
                >
                  <p className="px-1 text-xs font-medium uppercase tracking-wide text-obsidian-500">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((notification, index) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        index={index}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                </motion.section>
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
