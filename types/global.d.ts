export {};

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
    };
  }

  interface Navigator {
    standalone?: boolean;
  }
}
