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

/** TestFlight can load a Vercel preview instead of live getmixwise.com. */
function appServerUrl(raw: string, cleartext: boolean): CapacitorConfig['server'] {
  const url = new URL(raw);
  url.searchParams.set('mixwise_app', '1');
  return { url: url.toString(), cleartext };
}

const overrideUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: 'com.getmixwise.app',
  appName: 'MixWise',
  // Bundled fallback — production builds load from server.url instead.
  webDir: 'out',
  server: overrideUrl
    ? appServerUrl(overrideUrl, overrideUrl.startsWith('http://'))
    : isProduction
      ? appServerUrl('https://www.getmixwise.com/', false)
      : appServerUrl(devHost, true),
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#F9F7F2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
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
