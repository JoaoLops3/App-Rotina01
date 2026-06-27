export type TabId = "home" | "schedule" | "stats" | "profile";

const TAB_PATHS: Record<TabId, string> = {
  home: "/",
  schedule: "/agenda",
  stats: "/stats",
  profile: "/perfil",
};

export interface TabNavigationState {
  activeTab?: TabId;
}

export function resolveActiveTab(
  pathname: string,
  state: TabNavigationState | undefined,
): TabId {
  for (const [id, path] of Object.entries(TAB_PATHS) as [TabId, string][]) {
    if (pathname === path) return id;
  }

  if (state?.activeTab) return state.activeTab;

  return "home";
}

export function tabNavigationState(activeTab: TabId): TabNavigationState {
  return { activeTab };
}
