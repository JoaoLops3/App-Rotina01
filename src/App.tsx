import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Switch } from "react-router-dom";
import { useEffect } from "react";
import { DashboardScreen } from "./screens/DashboardScreen";
import { AgendaScreen } from "./screens/AgendaScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { NotificationPreferencesScreen } from "./screens/NotificationPreferencesScreen";
import { CustomTabBar } from "./components/CustomTabBar";
import { NewTaskSheet } from "./components/NewTaskSheet";
import { NativeNotificationBridge } from "./components/NativeNotificationBridge";
import { TasksProvider, useTasks } from "./lib/tasks-context";
import { ProfileProvider } from "./lib/profile-context";
import { NotificationsProvider } from "./lib/notifications-context";
import { syncNativeSchedulesFromStorage } from "./lib/native-notifications";
import { posthog } from "./lib/posthog";

setupIonicReact({
  mode: "ios",
  swipeBackEnabled: true,
  hardwareBackButton: true,
});

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

  useEffect(() => {
    void syncNativeSchedulesFromStorage(tasks);
  }, [tasks]);

  return (
    <>
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
      <CustomTabBar />
      <GlobalTaskSheet />
      <NativeNotificationBridge />
    </>
  );
}

function App() {
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
          posthog.captureException(err);
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
  );
}

export default App;
