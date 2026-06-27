import { ALL_STORAGE_KEYS } from "./storage-keys";

export function clearAllLocalAppData(): void {
  for (const key of ALL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage indisponível.
    }
  }
}
