import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "../types/avatar";
import { loadProfile, saveProfile } from "./profile-storage";
import { useAuth } from "./auth-context";
import { useSync } from "./sync-context";

interface ProfileContextValue {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  refresh: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile deve ser usado dentro de um ProfileProvider");
  }
  return ctx;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(() => loadProfile());
  const { isAuthenticated } = useAuth();
  const { registerSyncHandlers, scheduleProfilePush, isApplyingRemote } =
    useSync();

  useEffect(() => {
    registerSyncHandlers({
      applyProfile: (next) => setProfileState(next),
    });
  }, [registerSyncHandlers]);

  const setProfile = useCallback(
    (next: UserProfile) => {
      setProfileState(next);
      saveProfile(next);
      if (isAuthenticated && !isApplyingRemote) {
        scheduleProfilePush(next);
      }
    },
    [isAuthenticated, isApplyingRemote, scheduleProfilePush],
  );

  const refresh = useCallback(() => {
    setProfileState(loadProfile());
  }, []);

  const value: ProfileContextValue = { profile, setProfile, refresh };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
