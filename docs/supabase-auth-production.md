# Auth — URLs de produção (Supabase Dashboard)

Configure em **[Supabase Dashboard](https://supabase.com/dashboard/project/qellobflykthabmauicb/auth/url-configuration)** → **Authentication** → **URL Configuration**.

## Site URL

URL principal do app em produção:

```
https://SEU-DOMINIO.com
```

Se ainda não tiver domínio web, use a URL do deploy (ex. Vercel preview ou página de landing) até publicar o PWA/Capacitor com Universal Links.

Para **dev local**, o CLI usa `http://localhost:5173` (`supabase/config.toml`).

## Redirect URLs (adicione todas)

Copie e cole no campo **Redirect URLs** (uma por linha):

```
http://localhost:5173/login
http://127.0.0.1:5173/login
http://localhost:5173/cadastro
http://127.0.0.1:5173/cadastro
http://localhost:5173/recuperar-senha
https://SEU-DOMINIO.com/login
https://SEU-DOMINIO.com/cadastro
https://SEU-DOMINIO.com/recuperar-senha
capacitor://localhost/login
https://localhost/login
```

Substitua `SEU-DOMINIO.com` pelo domínio real quando publicar.

## Variável no app

No `.env` de produção:

```bash
VITE_APP_URL=https://SEU-DOMINIO.com
```

Usada em:
- confirmação de e-mail (`signUp`)
- recuperação de senha (`resetPasswordForEmail`)

Sem essa variável, o app usa `window.location.origin` (ok em dev).

## Capacitor (iOS/Android)

O app id é `com.joaolops3.approtina`. Para deep links de auth no nativo:

1. Configure **Universal Links** (iOS) / **App Links** (Android) apontando para `https://SEU-DOMINIO.com/*`
2. Mantenha `capacitor://localhost/login` como fallback de dev
3. O handler em `src/lib/auth-deeplink.ts` processa tokens no retorno

## Checklist pré-loja

- [ ] Site URL = domínio de produção
- [ ] Redirect URLs incluem `/login`, `/cadastro`, `/recuperar-senha`
- [ ] `VITE_APP_URL` no build de produção
- [ ] Testar fluxo: cadastro → e-mail → confirmar → login
- [ ] Testar fluxo: esqueci senha → e-mail → redefinir
