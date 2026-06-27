# Auditoria de segurança — Fase 11.1

| Campo | Valor |
|-------|-------|
| Data | 2026-06-27 |
| Branch | `feat/fase-11-1-schema-rls` (local) |
| Escopo | `supabase/migrations/`, `src/lib/supabase.ts`, `.env.example`, `docs/security-supabase-checklist.md` |
| Gate | **PASS** — zero CRITICAL / HIGH em aberto |

## Resumo

Auditoria read-first conforme `.cursor/plans/auditoria_supabase_gate.prompt.md`. Docker local indisponível nesta sessão; migration validada por revisão estática do SQL e build/typecheck do app.

## Achados

| Severidade | Localização | Achado | Status |
|------------|-------------|--------|--------|
| INFO | `.env.example` | Placeholders Supabase documentados; service_role explicitamente proibido com `VITE_` | OK |
| INFO | `src/lib/supabase.ts` | Client usa somente `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; guard em dev para chaves privilegiadas | OK |
| INFO | Migration | RLS ENABLED em 5 tabelas; policies `TO authenticated` com `auth.uid()` | OK |
| INFO | Migration | Sem `USING (true)` / `WITH CHECK (true)` em policies | OK |
| INFO | Migration | `handle_new_user` é `SECURITY DEFINER` com `search_path = public` | OK |
| LOW | Ambiente | `supabase db reset --local` não executado — Docker não estava rodando | Aceito — aplicar migration no remoto após `supabase link` |
| LOW | Ambiente | `supabase link` requer credenciais do projeto remoto (ação manual) | Pendente operacional |

## Checklist A — Segredos

- [x] Nenhum `.env` no histórico git (`git log --all -- .env .env.local`)
- [x] `.env.example` versionável (`!.env.example` no `.gitignore`)
- [x] Nenhuma chave hardcoded em TS/TSX

## Checklist D — RLS

- [x] `profiles` — ownership via `id = auth.uid()`
- [x] `tasks`, `day_history`, `notification_preferences`, `notifications` — `user_id = auth.uid()`
- [x] SELECT / INSERT / UPDATE / DELETE para cada tabela
- [x] Grants limitados: policies apenas para role `authenticated`

## Checklist E — Client

- [x] `getSupabase()` retorna `null` sem env — app continua 100% local
- [x] Providers não importam Supabase nesta fase

## Próximos passos (operacional)

1. Criar projeto no Supabase Dashboard (se ainda não existe).
2. `supabase link --project-ref <ref>`
3. `supabase db push` ou aplicar migration no dashboard.
4. Copiar URL + anon key para `.env.local`.
5. Iniciar **Fase 11.2** (auth).

## Veredito

**Gate aprovado** para prosseguir à Fase 11.2 após aplicar a migration no projeto remoto.
