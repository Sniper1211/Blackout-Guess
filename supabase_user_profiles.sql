-- 用户档案与角色管理（基于 uid，更稳妥的管理员识别）

create table if not exists public.user_profiles (
  user_id uuid primary key,
  email text unique,
  display_name text,
  role text check (role in ('user','admin')) default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.user_profiles is '应用用户档案表，含角色（user/admin）';

create index if not exists idx_user_profiles_email on public.user_profiles(email);

alter table public.user_profiles enable row level security;

-- 允许本人读取/更新自己的档案
drop policy if exists "profiles-self-select" on public.user_profiles;
create policy "profiles-self-select" on public.user_profiles
  for select using (user_id = auth.uid());

drop policy if exists "profiles-self-update" on public.user_profiles;
create policy "profiles-self-update" on public.user_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 管理员可读取全部（通过 admins 表或自身 role 判断）
drop policy if exists "profiles-admin-select" on public.user_profiles;
create policy "profiles-admin-select" on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

-- 管理员可更新任意人的角色（可选）：
drop policy if exists "profiles-admin-update" on public.user_profiles;
create policy "profiles-admin-update" on public.user_profiles
  for update using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

-- 触发器：更新 updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;$$;

drop trigger if exists trg_profiles_touch on public.user_profiles;
create trigger trg_profiles_touch
before update on public.user_profiles
for each row execute function public.touch_updated_at();
