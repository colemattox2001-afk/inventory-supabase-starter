
-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

create table if not exists tenant (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists app_user (
  id uuid primary key,
  email text not null,
  tenant_id uuid not null references tenant(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenant(id) on delete cascade,
  name text not null,
  unit text,
  min numeric default 0,
  location text,
  vendor text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists stock (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenant(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  qty numeric not null default 0,
  unique (tenant_id, item_id)
);

create table if not exists txn (
  id bigserial primary key,
  tenant_id uuid not null references tenant(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  delta numeric not null,
  reason text default 'adjust',
  meta jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now()
);

create or replace view item_view as
select i.*, coalesce(s.qty,0) as qty
from items i
left join stock s on s.item_id = i.id and s.tenant_id = i.tenant_id;

create or replace view needs_view as
select * from item_view where qty < min;
