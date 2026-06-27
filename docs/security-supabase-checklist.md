# Checklist de segurança — Supabase (App-Rotina)

Regras obrigatórias antes de merge na `main` e antes de releases com dados na nuvem.

## Chaves e variáveis de ambiente

| Regra | Detalhe |
|-------|---------|
| Anon key no client | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` em `src/lib/supabase.ts` |
| Service role fora do app | Somente Edge Functions, CI ou scripts server-side — **nunca** no bundle Capacitor |
| Sem prefixo público em chaves privilegiadas | Proibido `VITE_` / `EXPO_PUBLIC_` / `NEXT_PUBLIC_` em service_role, JWT secret ou DB password |
| `.env` fora do git | `.env` e `.env.*` no `.gitignore`; usar `.env.example` como template |
| PostHog no client | `VITE_POSTHOG_KEY` é aceitável — chave de projeto para analytics no browser |
| CI anti-secreto | Workflow `.github/workflows/secret-scan.yml` (gitleaks) no push/PR |

## Row Level Security (RLS)

| Regra | Detalhe |
|-------|---------|
| RLS em todas as tabelas de usuário | `profiles`, `tasks`, `day_history`, `notification_preferences`, `notifications` |
| Ownership por linha | Coluna `user_id` (ou `id` em `profiles`) = `auth.uid()` |
| Policies completas | SELECT, INSERT, UPDATE, DELETE com `auth.uid()` |
| UPDATE exige SELECT | Postgres RLS: sem policy SELECT, UPDATE retorna 0 rows silenciosamente |
| Sem policy aberta em prod | Proibido `USING (true)` / `WITH CHECK (true)` “só pra testar” |
| `user_id` do JWT | Nunca confiar em `user_id` vindo do body da request sem validar contra `auth.uid()` |
| Não usar `user_metadata` para auth | Metadados editáveis pelo usuário — usar `app_metadata` ou colunas em `profiles` |

## Funções e triggers

| Regra | Detalhe |
|-------|---------|
| `SECURITY DEFINER` | Sempre `SET search_path = public` (ou schema privado) |
| Triggers only | Revogar EXECUTE de funções trigger-only (`handle_new_user`) para anon/authenticated |
| Sem RPC público desnecessário | Funções expostas via PostgREST devem validar `auth.uid()` |

## Edge Functions (quando existirem)

- Verificar sessão / JWT em toda mutação.
- Usar service role apenas dentro da function, nunca expor ao client.
- Não logar tokens ou chaves em produção.

## Sync e migração (Fase 11.3)

- Import one-shot com confirmação do usuário.
- Não sobrescrever dados na nuvem sem aviso.
- RLS deve impedir que um usuário escreva em `user_id` de outro.

## Privacidade / analytics (fora do Postgres, mas relevante)

| Item | Severidade | Ação |
|------|------------|------|
| PostHog `task_title` em eventos | ~~MEDIUM~~ **Resolvido** | Usar `taskAnalyticsProps()` (`task_id` + metadados não-PII) |
| Dados locais em guest | INFO | `localStorage` legível no device — aceitável sem conta |

## Gate de auditoria

Rodar após cada PR que altera `supabase/migrations/`, `src/lib/supabase.ts` ou sync:

- Prompt: `.cursor/plans/auditoria_supabase_gate.prompt.md`
- Relatório: `docs/security-audit-fase-11-complete.md`
- Bloqueio: zero achados **CRITICAL** / **HIGH** em aberto

## Referências

- [`docs/supabase.md`](./supabase.md) — arquitetura e setup
- [`docs/sync-behavior.md`](./sync-behavior.md) — offline e conflitos
