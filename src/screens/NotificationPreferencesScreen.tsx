import { Redirect } from "react-router-dom";

/** Rota legada — redireciona para a tela geral de preferências. */
export function NotificationPreferencesScreen() {
  return <Redirect to="/preferencias" />;
}
