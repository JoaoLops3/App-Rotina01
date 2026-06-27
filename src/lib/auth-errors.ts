import type { AuthError } from "@supabase/supabase-js";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed:
    "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  user_already_registered: "Este e-mail já está cadastrado.",
  weak_password: "A senha deve ter pelo menos 6 caracteres.",
  invalid_email: "Informe um e-mail válido.",
  signup_disabled: "Cadastro temporariamente indisponível.",
  over_request_rate_limit: "Muitas tentativas. Aguarde um momento e tente de novo.",
};

export function mapAuthError(error: AuthError | null): string | null {
  if (!error) return null;

  if (error.message.includes("Invalid login credentials")) {
    return MESSAGES.invalid_credentials;
  }
  if (error.message.includes("Email not confirmed")) {
    return MESSAGES.email_not_confirmed;
  }
  if (error.message.includes("User already registered")) {
    return MESSAGES.user_already_registered;
  }
  if (error.message.includes("Password should be at least")) {
    return MESSAGES.weak_password;
  }
  if (error.message.includes("Unable to validate email")) {
    return MESSAGES.invalid_email;
  }
  if (error.message.includes("Signups not allowed")) {
    return MESSAGES.signup_disabled;
  }
  if (error.message.includes("rate limit")) {
    return MESSAGES.over_request_rate_limit;
  }

  return error.message || "Não foi possível concluir. Tente novamente.";
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Informe seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return MESSAGES.invalid_email;
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Informe sua senha.";
  if (password.length < 6) return MESSAGES.weak_password;
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  if (password !== confirmation) return "As senhas não coincidem.";
  return null;
}
