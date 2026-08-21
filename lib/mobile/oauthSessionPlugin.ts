import { registerPlugin } from "@capacitor/core";

export type MixwiseOAuthStartOptions = {
  url: string;
  /** Custom URL scheme only, e.g. com.getmixwise.app (pre–iOS 17.4) */
  callbackScheme: string;
  /** iOS 17.4+ HTTPS callback host (associated domain), e.g. www.getmixwise.com */
  callbackHTTPSHost?: string;
  /** iOS 17.4+ HTTPS callback path, e.g. /auth/native-callback */
  callbackHTTPSPath?: string;
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
