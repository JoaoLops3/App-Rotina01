# Supabase — pasta do CLI

Migrations versionadas do schema Postgres. Ver documentação completa em [`docs/supabase.md`](../docs/supabase.md).

## Comandos rápidos

```bash
supabase link --project-ref qellobflykthabmauicb
supabase db push
supabase db reset    # local + Docker
```

## Migrations

1. `20250627000000_initial_schema.sql` — schema + RLS + revokes em `handle_new_user`
2. `20250627000001_harden_function_security.sql` — idempotente com remoto (rls_auto_enable revoke)
