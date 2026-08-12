import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getmixwise.app',
  appName: 'MixWise',
  webDir: 'out', // Next.js static export output directory
  server: {
    // Development mode: point to Next.js dev server
    // Use IP address instead of localhost for iOS Simulator compatibility
    // For production builds, comment out url/cleartext to use local files
    url: 'http://192.168.86.26:3003',
    cleartext: true, // Allow HTTP in development
    
    // For production, API calls go to Vercel deployment
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    // Temporarily disabled due to Swift API compatibility issues
    // Will re-enable once plugins are updated
    // SplashScreen: {
    //   launchShowDuration: 2000,
    //   launchAutoHide: true,
    //   backgroundColor: '#F9F7F2',
    //   androidSplashResourceName: 'splash',
    //   androidScaleType: 'CENTER_CROP',
    //   showSpinner: false,
    //   iosSpinnerStyle: 'small',
    //   spinnerColor: '#999999',
    // },
    // StatusBar: {
    //   style: 'dark',
    //   backgroundColor: '#F9F7F2',
    // },
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
};

export default config;
