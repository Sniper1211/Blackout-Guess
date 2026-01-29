-- 超级简单的SQL测试脚本
-- 这个脚本绝对安全，不会因为表不存在而报错

-- 第1步：显示基本信息（绝对安全）
SELECT 
    '✅ 连接成功' as status,
    current_user as current_user,
    current_database() as database_name,
    version() as postgres_version;

-- 第2步：检查public模式权限（绝对安全）
SELECT 
    '检查public模式权限' as test,
    has_schema_privilege(current_user, 'public', 'CREATE') as can_create_tables,
    has_schema_privilege(current_user, 'public', 'USAGE') as can_use_schema;

-- 第3步：安全地检查表是否存在 - 方法1
SELECT '安全检查表是否存在' as test;
SELECT 
    'app_settings' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'app_settings'
        ) THEN '✅ 存在'
        ELSE '❌ 不存在'
    END as status;

-- 第4步：安全地检查表是否存在 - 方法2  
SELECT 
    'question_bank' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'question_bank'
        ) THEN '✅ 存在'
        ELSE '❌ 不存在'
    END as status;

-- 第5步：显示需要运行的SQL语句（只是显示，不执行）
SELECT '=== 需要运行的SQL语句 ===' as instruction;

SELECT '1. 创建app_settings表（如果不存在）' as step,
$$CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  daily_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);$$ as sql_command;

SELECT '2. 添加表注释' as step,
$$COMMENT ON TABLE public.app_settings IS '应用设置（单行），包含每日一题开关';
COMMENT ON COLUMN public.app_settings.daily_mode_enabled IS '是否启用每日一题（true=按排期每天一题；false=自由刷新不同题目）';$$ as sql_command;

SELECT '3. 初始化记录' as step,
$$INSERT INTO public.app_settings(id, daily_mode_enabled)
VALUES ('global', false)
ON CONFLICT (id) DO NOTHING;$$ as sql_command;

SELECT '4. 启用每日一题模式' as step,
$$UPDATE public.app_settings 
SET daily_mode_enabled = true, 
    updated_at = now()
WHERE id = 'global';$$ as sql_command;

SELECT '5. 检查结果' as step,
$$SELECT id, daily_mode_enabled, updated_at 
FROM public.app_settings 
WHERE id = 'global';$$ as sql_command;

-- 第6步：建议
SELECT '=== 建议 ===' as section;
SELECT '如果app_settings表不存在，请运行上面的第1-5步SQL语句' as suggestion;
SELECT '如果question_bank表不存在，请先运行supabase_admin_setup.sql脚本' as suggestion;
SELECT '完成配置后，访问 http://localhost:8001/test_calendar.html 测试功能' as suggestion;