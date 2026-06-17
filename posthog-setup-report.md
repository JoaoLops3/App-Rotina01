<wizard-report>
# PostHog post-wizard report

The wizard initially integrated `posthog-node` (server SDK — incompatible with browser). This was corrected to **`posthog-js`** + **`@posthog/react`**. Client: `src/lib/posthog.ts` with `captureEvent()` helper and `PostHogProvider` in `main.tsx`.

| Event | Description | File |
|---|---|---|
| `app opened` | App initialises and the dashboard is first rendered | `src/main.tsx` |
| `task started` | User starts a pending or paused task | `src/components/TaskCard.tsx` |
| `task paused` | User pauses a currently active task | `src/components/TaskCard.tsx` |
| `task completed` | User marks a task as completed | `src/screens/DashboardScreen.tsx` |
| `tab changed` | User navigates to a different bottom tab | `src/components/CustomTabBar.tsx` |
| `add task tapped` | User taps the centre + button | `src/components/CustomTabBar.tsx` |
| `stats viewed` | User taps "Ver Tudo" to see all statistics | `src/screens/DashboardScreen.tsx` |
| `session progress updated` | Active task timer reaches 100% completion | `src/screens/DashboardScreen.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/474823/dashboard/1726119)
- [Daily App Opens](https://us.posthog.com/project/474823/insights/z2npRCAy)
- [Task Starts Over Time](https://us.posthog.com/project/474823/insights/voFxUiC9)
- [Task Start → Completion Funnel](https://us.posthog.com/project/474823/insights/UahyGUOW)
- [Navigation by Tab](https://us.posthog.com/project/474823/insights/GMQmGqaL)
- [Session Completions](https://us.posthog.com/project/474823/insights/v6IBfkEA)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
