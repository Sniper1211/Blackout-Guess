-- 应用设置：每日一题模式开关
-- 运行本脚本后，将创建单行设置表，并允许任何人读取、仅管理员更新。

create table if not exists public.app_settings (
  id text primary key,
  daily_mode_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

comment on table public.app_settings is '应用设置（单行），包含每日一题开关';
comment on column public.app_settings.daily_mode_enabled is '是否启用每日一题（true=按排期每天一题；false=自由刷新不同题目）';

-- 初始化单行记录（全局）
insert into public.app_settings(id, daily_mode_enabled)
values ('global', false)
on conflict (id) do nothing;

-- 启用 RLS
alter table public.app_settings enable row level security;

-- 任何人可读（前端匿名也需要读设置）
create policy app_settings_read for select on public.app_settings
  using (true);

-- 仅管理员可插入/更新（基于 user_profiles.role='admin' 或 admins(email) 兼容）
create policy app_settings_admin_insert for insert on public.app_settings
  with check (
    exists (
      select 1 from public.user_profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

create policy app_settings_admin_update for update on public.app_settings
  using (
    exists (
      select 1 from public.user_profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  )
  with check (
    exists (
      select 1 from public.user_profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
    or (auth.jwt() ->> 'user_role') = 'admin'
  );

-- 自动维护 updated_at/updated_by
create or replace function public.app_settings_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  begin
    new.updated_by := auth.uid();
  exception when others then
    new.updated_by := null;
  end;
  return new;
end;$$;

drop trigger if exists trg_app_settings_touch on public.app_settings;
create trigger trg_app_settings_touch
before insert or update on public.app_settings
for each row execute function public.app_settings_touch();
