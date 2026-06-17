import posthog from 'posthog-js';

const apiKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const apiHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

if (apiKey && typeof window !== 'undefined') {
  posthog.init(apiKey, {
    api_host: apiHost ?? 'https://us.i.posthog.com',
    defaults: '2026-01-30',
    capture_exceptions: true,
    persistence: 'localStorage',
  });
}

export { posthog };

export function getDistinctId(): string {
  return posthog.get_distinct_id();
}

export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!apiKey) return;
  posthog.capture(event, properties);
}
