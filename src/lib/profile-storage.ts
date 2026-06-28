import type { UserProfile } from "../types/avatar";

import { STORAGE_KEYS } from "./storage-keys";

const STORAGE_KEY = STORAGE_KEYS.profile;

export const DEFAULT_ACCOUNT_NAME = "Alex";

/** Limite só para exibição no header do perfil (nome completo continua salvo). */
export const PROFILE_HEADER_NAME_MAX_LENGTH = 20;

const DEFAULT_PROFILE: UserProfile = {
  accountName: DEFAULT_ACCOUNT_NAME,
  nickname: null,
  avatarSeed: null,
  avatarStyle: "toon-head",
};

export function getShownName(profile: UserProfile): string {
  return profile.nickname?.trim() || profile.accountName.trim() || DEFAULT_ACCOUNT_NAME;
}

export function truncateForProfileHeader(
  name: string,
  maxLength = PROFILE_HEADER_NAME_MAX_LENGTH,
): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function isProfileHeaderNameTruncated(
  name: string,
  maxLength = PROFILE_HEADER_NAME_MAX_LENGTH,
): boolean {
  return name.trim().length > maxLength;
}

function migrateLegacyProfile(parsed: Record<string, unknown>): UserProfile {
  if (typeof parsed.accountName === "string") {
    return {
      accountName: parsed.accountName.trim() || DEFAULT_ACCOUNT_NAME,
      nickname:
        typeof parsed.nickname === "string" && parsed.nickname.trim()
          ? parsed.nickname.trim()
          : null,
      avatarSeed:
        typeof parsed.avatarSeed === "string" ? parsed.avatarSeed : null,
      avatarStyle: "toon-head",
    };
  }

  const legacyDisplayName =
    typeof parsed.displayName === "string" ? parsed.displayName.trim() : "";

  return {
    accountName: legacyDisplayName || DEFAULT_ACCOUNT_NAME,
    nickname: null,
    avatarSeed:
      typeof parsed.avatarSeed === "string" ? parsed.avatarSeed : null,
    avatarStyle: "toon-head",
  };
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrateLegacyProfile(parsed);
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
