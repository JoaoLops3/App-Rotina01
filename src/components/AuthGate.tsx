import { type ReactNode, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { Redirect, useLocation } from "react-router-dom";
import { useAuth, isAuthRoute } from "../lib/auth-context";
import { AppLogo } from "./AppLogo";

function AuthLoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center"
      style={{ backgroundColor: "#0d0d12" }}
      aria-busy="true"
      aria-label="Carregando"
    >
      <AppLogo size={48} className="animate-pulse" />
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, authConfigured } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const splashHiddenRef = useRef(false);

  useEffect(() => {
    if (isLoading || splashHiddenRef.current || !Capacitor.isNativePlatform()) {
      return;
    }
    splashHiddenRef.current = true;
    void SplashScreen.hide();
  }, [isLoading]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!authConfigured) {
    return <>{children}</>;
  }

  if (!isAuthenticated && !isAuthRoute(pathname)) {
    return <Redirect to="/login" />;
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/cadastro")) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
