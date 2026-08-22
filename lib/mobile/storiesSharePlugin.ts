import { registerPlugin } from "@capacitor/core";

export type StoriesShareOptions = {
  /** Meta / Facebook App ID (required by Instagram & Facebook Stories). */
  facebookAppId: string;
  /** Local file path from Capacitor Camera (preferred — avoids huge bridge payloads). */
  backgroundImagePath?: string;
  /** PNG/JPEG as raw base64 or data URL (fallback). */
  backgroundImageBase64?: string;
  /** Transparent PNG sticker as raw base64 or data URL. */
  stickerImageBase64?: string;
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
};

export type SnapchatStoriesShareOptions = {
  /** Snap Kit Client ID from developers.snap.com */
  snapchatClientId: string;
  backgroundImagePath?: string;
  backgroundImageBase64?: string;
  stickerImageBase64?: string;
  attachmentUrl?: string;
};

export type MixwiseStoriesPlugin = {
  canShareToInstagramStories(): Promise<{ available: boolean }>;
  canShareToFacebookStories(): Promise<{ available: boolean }>;
  canShareToSnapchatStories(): Promise<{ available: boolean }>;
  shareToInstagramStories(options: StoriesShareOptions): Promise<{ shared: boolean }>;
  shareToFacebookStories(options: StoriesShareOptions): Promise<{ shared: boolean }>;
  shareToSnapchatStories(options: SnapchatStoriesShareOptions): Promise<{ shared: boolean }>;
};

export const MixwiseStories = registerPlugin<MixwiseStoriesPlugin>("MixwiseStories");
