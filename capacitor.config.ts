import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.focusflow',
  appName: 'FocusFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  statusBar: {
    style: 'DARK',
    backgroundColor: '#0d0d12',
  },
  splashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#0d0d12',
    androidSplashResourceName: 'splash',
    showSpinner: false,
  },
  keyboard: {
    resize: 'body',
    resizeOnFullScreen: true,
  },
};

export default config;
