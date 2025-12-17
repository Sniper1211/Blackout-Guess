-- Supabase 管理员与 RLS、题库字段扩展（兼容新版 admins 架构与 JWT claims）
-- 使用前：请在 Supabase SQL 控制台执行

-- 1) 管理员表：用于在 RLS 中判定管理权限（uuid 主键 + 关联 auth.users）
create extension if not exists pgcrypto;
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  email text,
  role text default 'admin',
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_admins_auth_user_id on public.admins(auth_user_id);
create index if not exists idx_admins_role on public.admins(role);
create index if not exists idx_admins_is_active on public.admins(is_active);

comment on table public.admins is '站点管理员列表，通过 auth_user_id/role/is_active 判定';

-- 示例：插入管理员（请替换为实际用户的 UID 与邮箱）
-- insert into public.admins(auth_user_id, email, role, is_active) values ('00000000-0000-0000-0000-000000000000', 'your-admin@example.com', 'admin', true);

-- 2) question_bank 字段扩展：状态、排期与审计
alter table public.question_bank
  add column if not exists status text check (status in ('draft','scheduled','published')) default 'draft',
  add column if not exists publish_date date,
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid;

comment on column public.question_bank.status is '内容状态：draft/scheduled/published';
comment on column public.question_bank.publish_date is '计划发布日期（每日一个）';
comment on column public.question_bank.published_at is '实际发布时间戳（自动或手动发布时填写）';
comment on column public.question_bank.created_by is '创建人（auth.uid()）';
comment on column public.question_bank.updated_by is '最后更新人（auth.uid()）';

-- 3) 启用 RLS（如未启用）
alter table public.question_bank enable row level security;

-- 4) 允许所有用户读取已发布内容
drop policy if exists "read-published-all" on public.question_bank;
create policy "read-published-all" on public.question_bank
  for select
  using (status = 'published');

-- 5) 管理员可读取全部（基于 user_profiles.role 或 JWT claim user_role）
drop policy if exists "read-all-admin" on public.question_bank;
create policy "read-all-admin" on public.question_bank
  for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

-- 6) 仅管理员可写（插入/更新/删除，基于 user_profiles.role 或 JWT claim）
drop policy if exists "insert-admin" on public.question_bank;
create policy "insert-admin" on public.question_bank
  for insert
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

drop policy if exists "update-admin" on public.question_bank;
create policy "update-admin" on public.question_bank
  for update
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

drop policy if exists "delete-admin" on public.question_bank;
create policy "delete-admin" on public.question_bank
  for delete
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

-- 7) 触发器（可选）：写入 created_by/updated_by
create or replace function public.set_audit_fields()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
  elsif tg_op = 'UPDATE' then
    new.updated_by := auth.uid();
  end if;
  return new;
end;$$;

drop trigger if exists trg_question_bank_audit on public.question_bank;
create trigger trg_question_bank_audit
before insert or update on public.question_bank
for each row execute function public.set_audit_fields();
