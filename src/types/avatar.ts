export type AvatarStyle = "toon-head";

export interface UserProfile {
  accountName: string;
  nickname: string | null;
  avatarSeed: string | null;
  avatarStyle: AvatarStyle;
}

export interface AvatarProps {
  seed: string;
  style?: AvatarStyle;
  size?: number;
  alt?: string;
  className?: string;
}

export interface AvatarSelection {
  seed: string;
  style: AvatarStyle;
}

export interface AvatarPickerProps {
  initialSeed?: string | null;
  onConfirm: (selection: AvatarSelection) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface UseUpdateAvatarResult {
  updateAvatar: (seed: string, style?: AvatarStyle) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

export interface UseUpdateNicknameResult {
  updateNickname: (nickname: string) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}
