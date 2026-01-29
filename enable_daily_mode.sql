-- 启用每日一题模式 - 完整脚本
-- 运行此脚本将：1) 创建表（如果不存在） 2) 启用每日一题模式

-- 第一步：创建 app_settings 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  daily_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

COMMENT ON TABLE public.app_settings IS '应用设置（单行），包含每日一题开关';
COMMENT ON COLUMN public.app_settings.daily_mode_enabled IS '是否启用每日一题（true=按排期每天一题；false=自由刷新不同题目）';

-- 第二步：初始化单行记录（如果不存在）
INSERT INTO public.app_settings(id, daily_mode_enabled)
VALUES ('global', false)
ON CONFLICT (id) DO NOTHING;

-- 第三步：启用每日一题模式
UPDATE public.app_settings 
SET daily_mode_enabled = true, 
    updated_at = now()
WHERE id = 'global';

-- 第四步：检查设置是否已更新
SELECT id, daily_mode_enabled, updated_at 
FROM public.app_settings 
WHERE id = 'global';

-- 检查题目数据（示例：查看2026年1月的题目）
SELECT id, title, publish_date, status
FROM public.question_bank
WHERE publish_date >= '2026-01-21' 
  AND publish_date <= '2026-01-28'
  AND status = 'published'
ORDER BY publish_date;

-- 如果没有题目数据，需要手动添加题目
-- 示例插入语句（需要根据实际情况修改）：
/*
INSERT INTO public.question_bank (
    type, title, content, author, dynasty, 
    enabled, language, status, publish_date, published_at
) VALUES 
    ('poem', '题目1', '内容1', '作者1', '朝代1', 
     true, 'zh-CN', 'published', '2026-01-21', now()),
    ('poem', '题目2', '内容2', '作者2', '朝代2', 
     true, 'zh-CN', 'published', '2026-01-22', now()),
    ('poem', '题目3', '内容3', '作者3', '朝代3', 
     true, 'zh-CN', 'published', '2026-01-23', now()),
    ('poem', '题目4', '内容4', '作者4', '朝代4', 
     true, 'zh-CN', 'published', '2026-01-24', now()),
    ('poem', '题目5', '内容5', '作者5', '朝代5', 
     true, 'zh-CN', 'published', '2026-01-25', now()),
    ('poem', '题目6', '内容6', '作者6', '朝代6', 
     true, 'zh-CN', 'published', '2026-01-26', now()),
    ('poem', '题目7', '内容7', '作者7', '朝代7', 
     true, 'zh-CN', 'published', '2026-01-27', now()),
    ('poem', '题目8', '内容8', '作者8', '朝代8', 
     true, 'zh-CN', 'published', '2026-01-28', now());
*/