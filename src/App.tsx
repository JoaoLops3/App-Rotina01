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
import { CustomTabBar } from "./components/CustomTabBar";
import { NewTaskSheet } from "./components/NewTaskSheet";
import { TasksProvider, useTasks } from "./lib/tasks-context";
import { NotificationsProvider } from "./lib/notifications-context";
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

function App() {
  useEffect(() => {
    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0d0d12" });
        await SplashScreen.hide();
      } catch (err) {
        // Plugins unavailable in browser (ionic serve)
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
      <TasksProvider>
        <NotificationsProvider>
          <IonReactRouter>
            <IonRouterOutlet animated={false}>
              <Switch>
                <Route exact path="/" component={DashboardScreen} />
                <Route exact path="/agenda" component={AgendaScreen} />
                <Route exact path="/stats" component={StatsScreen} />
                <Route exact path="/perfil" component={ProfileScreen} />
                <Route
                  exact
                  path="/notificacoes"
                  component={NotificationsScreen}
                />
              </Switch>
            </IonRouterOutlet>
            <CustomTabBar />
            <GlobalTaskSheet />
          </IonReactRouter>
        </NotificationsProvider>
      </TasksProvider>
    </IonApp>
  );
}

export default App;
