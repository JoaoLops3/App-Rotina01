import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.joaolops3.trilho",
  appName: "Trilho",
  webDir: "dist",
  backgroundColor: "#0d0d12",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    contentInset: "never",
    scrollEnabled: true,
    backgroundColor: "#0d0d12",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0d0d12",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 0,
      backgroundColor: "#0d0d12",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d0d12",
      overlaysWebView: true,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      presentationOptions: ["badge", "sound", "banner", "list"],
    },
  },
};

export default config;
