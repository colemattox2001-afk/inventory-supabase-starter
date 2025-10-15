
alter table app_user enable row level security;
alter table items enable row level security;
alter table stock enable row level security;
alter table txn enable row level security;

create policy app_user_self_read on app_user
for select using (id = auth.uid());

create policy items_select on items
for select using (tenant_id = current_tenant_id());

create policy items_modify on items
for insert with check (tenant_id = current_tenant_id())
, for update using (tenant_id = current_tenant_id())
, for delete using (tenant_id = current_tenant_id());

create policy stock_select on stock
for select using (tenant_id = current_tenant_id());

create policy stock_modify on stock
for insert with check (tenant_id = current_tenant_id())
, for update using (tenant_id = current_tenant_id())
, for delete using (tenant_id = current_tenant_id());

create policy txn_select on txn
for select using (tenant_id = current_tenant_id());

create policy txn_insert on txn
for insert with check (tenant_id = current_tenant_id());
