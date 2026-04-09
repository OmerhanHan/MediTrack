# Edge Functions Security Setup

## Required secrets

Set these in Supabase project secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY`

## Deploy functions

```bash
supabase functions deploy patient-write
supabase functions deploy appointment-write
supabase functions deploy admin-account-review
```

## Apply SQL migrations

1. `migration_security_hardening_serverless.sql`
2. `migration_edge_functions_write_lockdown.sql`

Apply in this order.

