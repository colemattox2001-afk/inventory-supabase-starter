# Inventory — Multi‑Tenant (Next.js + Supabase)

## Why this is the best fit
- One codebase for all clinics, proper access control with **Row‑Level Security**.
- Free tiers on **Vercel** + **Supabase** for pilots.
- Simple onboarding: create tenant → invite users → they only see their clinic’s data.

## Setup
1) Create a Supabase project. Copy URL + anon key to `.env.local` (use `.env.example`).
2) In Supabase **SQL Editor**, run: `db/schema.sql`, then `db/functions.sql`, then `db/policies.sql`.
3) Enable **Email** auth provider.
4) Seed yourself:
   ```sql
   insert into tenant (name) values ('Clinic A') returning id;
   -- copy result id into :t
   insert into app_user (id, email, tenant_id, role)
   values ((select id from auth.users where email='YOUR_EMAIL'), 'YOUR_EMAIL', ':t', 'admin');
   ```
5) Install & run:
   ```bash
   npm install
   npm run dev
   ```

## App routes
- `/login` — email/password login.
- `/items` — add/edit items; +/− adjusts quantity via `adjust_stock` RPC (writes to `txn`).
- `/needs` — auto view where `qty < min`.
- `/admin` — create tenant + assign an admin by email.

## Notes
- Keep data non‑PHI. Add barcode scanning, PO PDFs, CSV import/export as needed.
- To restrict `/admin` to HQ, add a policy check for `role = 'hq_admin'` or gate via a server route.
