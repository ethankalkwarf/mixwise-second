import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { networkInterfaces } from 'os';

/** Detect LAN IP so the iOS Simulator can reach the Next.js dev server. */
function getLocalIp(): string {
  const nets = networkInterfaces();
  for (const iface of Object.values(nets)) {
    if (!iface) continue;
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const isProduction = process.env.CAPACITOR_ENV === 'production';
const devPort = process.env.CAPACITOR_DEV_PORT ?? '3000';
const devHost = `http://${getLocalIp()}:${devPort}`;

const config: CapacitorConfig = {
  appId: 'com.getmixwise.app',
  appName: 'MixWise',
  // Bundled fallback — production builds load from server.url instead.
  webDir: 'out',
  server: isProduction
    ? {
        url: 'https://www.getmixwise.com/?mixwise_app=1',
        cleartext: false,
      }
    : {
        url: `${devHost}/?mixwise_app=1`,
        cleartext: true,
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#F9F7F2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Light,
    },
  },
  ios: {
    contentInset: 'never',
    scrollEnabled: true,
    allowsLinkPreview: true,
    appendUserAgent: 'MixWiseNative',
  },
};

export default config;
