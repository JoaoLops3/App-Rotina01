import { useProfile } from "./profile-context";

export function useDailyGoal(): number {
  const { profile } = useProfile();
  return profile.dailyGoalMinutes;
}
