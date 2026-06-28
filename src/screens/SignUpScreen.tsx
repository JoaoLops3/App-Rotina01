import { Redirect, useLocation } from "react-router-dom";

/** Cadastro unificado na tela de login (`/login?mode=cadastro`). */
export function SignUpScreen() {
  const location = useLocation();
  const search = location.search ? location.search : "?mode=cadastro";
  const hasMode = new URLSearchParams(search).has("mode");
  return <Redirect to={hasMode ? `/login${search}` : "/login?mode=cadastro"} />;
}
