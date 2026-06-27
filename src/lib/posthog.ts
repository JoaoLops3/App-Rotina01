import posthog from "posthog-js";
import { Capacitor } from "@capacitor/core";

const apiKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const apiHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

interface QueuedEvent {
  event: string;
  properties?: EventProperties;
}

let initialized = false;
let scheduled = false;
const pendingEvents: QueuedEvent[] = [];

export function initPostHog(): void {
  if (initialized || !apiKey || typeof window === "undefined") return;
  initialized = true;

  const isNative = Capacitor.isNativePlatform();

  posthog.init(apiKey, {
    api_host: apiHost ?? "https://us.i.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    persistence: "localStorage",
    disable_session_recording: isNative,
    disable_surveys: isNative,
    ...(isNative
      ? {
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
        }
      : {}),
  });

  for (const { event, properties } of pendingEvents) {
    posthog.capture(event, properties);
  }
  pendingEvents.length = 0;
}

/**
 * Agenda a inicialização do PostHog para depois do primeiro paint, evitando que
 * o boot da aplicação concorra com o carregamento dos scripts de analytics.
 */
export function schedulePostHogInit(): void {
  if (initialized || scheduled || !apiKey || typeof window === "undefined")
    return;
  scheduled = true;

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => initPostHog(), { timeout: 3000 });
  } else {
    window.setTimeout(() => initPostHog(), 1500);
  }
}

export { posthog };

export function getDistinctId(): string {
  return posthog.get_distinct_id();
}

export function captureEvent(
  event: string,
  properties?: EventProperties,
): void {
  if (!apiKey) return;
  if (!initialized) {
    pendingEvents.push({ event, properties });
    schedulePostHogInit();
    return;
  }
  posthog.capture(event, properties);
}

export function captureException(error: unknown): void {
  if (!apiKey) return;
  initPostHog();
  posthog.captureException(error);
}

export function identifyUser(
  userId: string,
  properties?: EventProperties,
): void {
  if (!apiKey) return;
  initPostHog();
  posthog.identify(userId, properties);
}

export function resetAnalyticsUser(): void {
  if (!apiKey) return;
  initPostHog();
  posthog.reset();
}
