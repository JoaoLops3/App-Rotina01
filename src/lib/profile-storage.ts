import type { UserProfile } from "../types/avatar";

import { STORAGE_KEYS } from "./storage-keys";

const STORAGE_KEY = STORAGE_KEYS.profile;

const DEFAULT_PROFILE: UserProfile = {
  displayName: "Alex",
  avatarSeed: null,
  avatarStyle: "toon-head",
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName:
        typeof parsed.displayName === "string"
          ? parsed.displayName
          : DEFAULT_PROFILE.displayName,
      avatarSeed:
        typeof parsed.avatarSeed === "string" ? parsed.avatarSeed : null,
      avatarStyle: "toon-head",
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage indisponível (modo privado, cota cheia): ignora silenciosamente.
  }
}
