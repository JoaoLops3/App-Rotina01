import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Switch } from "react-router-dom";
import { Suspense, lazy, useEffect, useMemo } from "react";
import { DashboardScreen } from "./screens/DashboardScreen";
import { CustomTabBar } from "./components/CustomTabBar";
import { NewTaskSheet } from "./components/NewTaskSheet";
import { NativeNotificationBridge } from "./components/NativeNotificationBridge";
import { TasksProvider, useTasks } from "./lib/tasks-context";
import { ProfileProvider } from "./lib/profile-context";
import { NotificationsProvider } from "./lib/notifications-context";
import { syncNativeSchedulesFromStorage } from "./lib/native-notifications";
import { captureException } from "./lib/posthog";
import { MotionProvider } from "./lib/motion";

const AgendaScreen = lazy(() =>
  import("./screens/AgendaScreen").then((m) => ({ default: m.AgendaScreen })),
);
const StatsScreen = lazy(() =>
  import("./screens/StatsScreen").then((m) => ({ default: m.StatsScreen })),
);
const ProfileScreen = lazy(() =>
  import("./screens/ProfileScreen").then((m) => ({ default: m.ProfileScreen })),
);
const NotificationsScreen = lazy(() =>
  import("./screens/NotificationsScreen").then((m) => ({
    default: m.NotificationsScreen,
  })),
);
const NotificationPreferencesScreen = lazy(() =>
  import("./screens/NotificationPreferencesScreen").then((m) => ({
    default: m.NotificationPreferencesScreen,
  })),
);

setupIonicReact({
  mode: "ios",
  swipeBackEnabled: true,
  hardwareBackButton: true,
});

function RouteFallback() {
  return (
    <div
      className="fixed inset-0 z-0"
      style={{ backgroundColor: "#0d0d12" }}
      aria-hidden="true"
    />
  );
}

function GlobalTaskSheet() {
  const { isNewTaskOpen, taskToEdit, closeTaskSheet, submitTask } = useTasks();
  return (
    <NewTaskSheet
      isOpen={isNewTaskOpen}
      onClose={closeTaskSheet}
      onSubmit={submitTask}
      taskToEdit={taskToEdit}
    />
  );
}

function AppRoutes() {
  const { tasks } = useTasks();

  // Só ressincroniza notificações nativas quando muda algo relevante para o
  // agendamento (status, horário, duração, criação/remoção) — nunca a cada
  // tick do timer, que altera apenas o elapsed.
  const notificationFingerprint = useMemo(
    () =>
      tasks
        .map(
          (t) => `${t.id}:${t.status}:${t.scheduledTime ?? ""}:${t.duration}`,
        )
        .join("|"),
    [tasks],
  );

  useEffect(() => {
    void syncNativeSchedulesFromStorage(tasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationFingerprint]);

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <IonRouterOutlet animated={false}>
          <Switch>
            <Route exact path="/" component={DashboardScreen} />
            <Route exact path="/agenda" component={AgendaScreen} />
            <Route exact path="/stats" component={StatsScreen} />
            <Route exact path="/perfil" component={ProfileScreen} />
            <Route exact path="/notificacoes" component={NotificationsScreen} />
            <Route
              exact
              path="/notificacoes/preferencias"
              component={NotificationPreferencesScreen}
            />
          </Switch>
        </IonRouterOutlet>
      </Suspense>
      <CustomTabBar />
      <GlobalTaskSheet />
      <NativeNotificationBridge />
    </>
  );
}

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.documentElement.classList.add("native-platform");
    }
  }, []);

  useEffect(() => {
    const initNative = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await SplashScreen.hide();
      } catch (err) {
        if (
          err instanceof Error &&
          err.message &&
          !err.message.includes("not implemented")
        ) {
          captureException(err);
        }
      }
    };

    initNative();

    const backListener = CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      void backListener.then((l) => l.remove());
    };
  }, []);

  return (
    <MotionProvider>
      <IonApp>
        <ProfileProvider>
          <TasksProvider>
            <NotificationsProvider>
              <IonReactRouter>
                <AppRoutes />
              </IonReactRouter>
            </NotificationsProvider>
          </TasksProvider>
        </ProfileProvider>
      </IonApp>
    </MotionProvider>
  );
}

export default App;
