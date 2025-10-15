
create or replace function current_tenant_id()
returns uuid language sql security definer set search_path = public as $$
  select tenant_id from app_user where id = auth.uid();
$$;

create or replace function adjust_stock(p_item_id uuid, p_delta numeric)
returns void language plpgsql security definer as $$
declare
  t_id uuid := current_tenant_id();
begin
  if t_id is null then raise exception 'No tenant for user'; end if;
  insert into stock (tenant_id, item_id, qty)
  values (t_id, p_item_id, 0)
  on conflict (tenant_id, item_id) do nothing;
  update stock set qty = qty + p_delta where tenant_id = t_id and item_id = p_item_id;
  insert into txn (tenant_id, item_id, delta, created_by) values (t_id, p_item_id, p_delta, auth.uid());
end; $$;

create or replace function create_tenant_with_admin(p_name text, p_admin_email text)
returns uuid language plpgsql security definer as $$
declare t_id uuid; u_id uuid;
begin
  insert into tenant(name) values (p_name) returning id into t_id;
  select id into u_id from auth.users where email = p_admin_email;
  if u_id is null then u_id := gen_random_uuid(); end if;
  insert into app_user(id, email, tenant_id, role) values (u_id, p_admin_email, t_id, 'admin')
  on conflict (id) do update set tenant_id = excluded.tenant_id, role = 'admin';
  return t_id;
end; $$;

create or replace function touch_items_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_items_touch on items;
create trigger trg_items_touch before update on items
for each row execute procedure touch_items_updated_at();
