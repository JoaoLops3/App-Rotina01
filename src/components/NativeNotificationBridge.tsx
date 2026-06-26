import { useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useHistory } from "react-router-dom";
import { getNotificationNavigationTarget } from "../lib/notification-deeplink";
import {
  extraToInboxEntry,
  parseNativeNotificationExtra,
} from "../lib/notification-copy";
import { useNotifications } from "../lib/notifications-context";
import {
  syncDeliveredNotificationsToInbox,
  syncNativeSchedulesFromStorage,
} from "../lib/native-notifications";
import { useTasks } from "../lib/tasks-context";

export function NativeNotificationBridge() {
  const history = useHistory();
  const { pushFromNative } = useNotifications();
  const { tasks } = useTasks();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void syncDeliveredNotificationsToInbox(pushFromNative);

    const receivedListener = LocalNotifications.addListener(
      "localNotificationReceived",
      (notification) => {
        const entry = extraToInboxEntry(
          parseNativeNotificationExtra(notification.extra),
        );
        if (entry) pushFromNative(entry);
      },
    );

    const actionListener = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => {
        const extra = parseNativeNotificationExtra(event.notification.extra);
        if (extra.type) {
          const target = getNotificationNavigationTarget(
            extra.type,
            extra.taskId,
          );
          history.push({
            pathname: target.pathname,
            search: target.search,
          });
        }
      },
    );

    const appStateListener = CapApp.addListener("appStateChange", (state) => {
      if (!state.isActive) return;
      void syncDeliveredNotificationsToInbox(pushFromNative);
      void syncNativeSchedulesFromStorage(tasks);
    });

    return () => {
      void receivedListener.then((listener) => listener.remove());
      void actionListener.then((listener) => listener.remove());
      void appStateListener.then((listener) => listener.remove());
    };
  }, [history, pushFromNative, tasks]);

  return null;
}
