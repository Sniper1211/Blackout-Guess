-- SQL语法测试脚本
-- 这个脚本用于测试SQL语法是否正确，不会修改数据库

-- 测试1：检查表是否存在（安全版本，不会因为表不存在而报错）
SELECT 
    table_name,
    '✅ 存在' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('app_settings', 'question_bank')
UNION ALL
SELECT 
    'app_settings' as table_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'app_settings'
        ) THEN '❌ 不存在'
        ELSE '✅ 存在'
    END as status
UNION ALL
SELECT 
    'question_bank' as table_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'question_bank'
        ) THEN '❌ 不存在'
        ELSE '✅ 存在'
    END as status
ORDER BY table_name;

-- 测试2：模拟创建表（注释掉实际创建）
/*
CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  daily_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
*/

-- 测试3：显示创建表的SQL语句
SELECT 'CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  daily_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);' as create_table_sql;

-- 测试4：显示启用每日一题的SQL语句
SELECT 'UPDATE public.app_settings 
SET daily_mode_enabled = true, 
    updated_at = now()
WHERE id = ''global'';' as enable_daily_mode_sql;

-- 测试5：显示检查结果的SQL语句
SELECT 'SELECT id, daily_mode_enabled, updated_at 
FROM public.app_settings 
WHERE id = ''global'';' as check_result_sql;

-- 测试6：显示添加示例题目的SQL语句
SELECT 'INSERT INTO public.question_bank (
    type, title, content, author, dynasty, 
    enabled, language, status, publish_date, published_at
) VALUES 
    (''poem'', ''静夜思'', ''静夜思\n床前明月光，疑是地上霜。举头望明月，低头思故乡。'', ''李白'', ''唐'', 
     true, ''zh-CN'', ''published'', ''2026-01-21'', now());' as insert_example_sql;

-- 测试7：当前数据库信息
SELECT 
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version,
    current_timestamp as current_time;

-- 测试8：检查数据库权限（安全版本）
SELECT 
    current_user as current_user,
    current_database() as database_name,
    version() as postgres_version,
    current_timestamp as current_time,
    
    -- 检查是否有创建表的权限（不指定具体表名）
    has_schema_privilege(current_user, 'public', 'CREATE') as can_create_in_public,
    has_schema_privilege(current_user, 'public', 'USAGE') as can_use_public_schema,
    
    -- 检查是否有创建表的通用权限
    '需要手动检查' as app_settings_permissions,
    '需要手动检查' as question_bank_permissions;