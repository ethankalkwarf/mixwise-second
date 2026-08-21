import { registerPlugin } from "@capacitor/core";

export type MixwiseOAuthStartOptions = {
  url: string;
  /** Custom URL scheme only, e.g. com.getmixwise.app */
  callbackScheme: string;
  prefersEphemeralWebBrowserSession?: boolean;
};

export type MixwiseOAuthStartResult = {
  url: string;
};

export type MixwiseOAuthPlugin = {
  start(options: MixwiseOAuthStartOptions): Promise<MixwiseOAuthStartResult>;
  /** Dismisses the ASWebAuthenticationSession sheet if still visible. */
  cancel(): Promise<void>;
};

/** iOS-only plugin registered from MixWiseBridgeViewController. */
export const MixwiseOAuth = registerPlugin<MixwiseOAuthPlugin>("MixwiseOAuth");
