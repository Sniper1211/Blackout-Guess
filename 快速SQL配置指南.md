# 快速SQL配置指南

## 问题诊断
您遇到的错误：`relation "public.app_settings" does not exist` 表示 `app_settings` 表不存在。

## 解决方案

### 方法一：运行完整脚本（推荐）
直接运行修复后的 `enable_daily_mode.sql` 脚本，它现在包含表创建逻辑：

1. 访问 https://app.supabase.com/
2. 选择您的项目
3. 进入 **SQL Editor**
4. 点击 **New query**
5. 复制以下完整SQL代码：

```sql
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

-- 第五步：检查题目数据（示例：查看2026年1月的题目）
SELECT id, title, publish_date, status
FROM public.question_bank
WHERE publish_date >= '2026-01-21' 
  AND publish_date <= '2026-01-28'
  AND status = 'published'
ORDER BY publish_date;
```

6. 点击 **Run** 按钮执行

### 方法二：分步执行
如果完整脚本有问题，可以分步执行：

#### 步骤1：创建表
```sql
-- 创建 app_settings 表
CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  daily_mode_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
```

#### 步骤2：添加注释
```sql
COMMENT ON TABLE public.app_settings IS '应用设置（单行），包含每日一题开关';
COMMENT ON COLUMN public.app_settings.daily_mode_enabled IS '是否启用每日一题（true=按排期每天一题；false=自由刷新不同题目）';
```

#### 步骤3：初始化记录
```sql
INSERT INTO public.app_settings(id, daily_mode_enabled)
VALUES ('global', false)
ON CONFLICT (id) DO NOTHING;
```

#### 步骤4：启用每日一题
```sql
UPDATE public.app_settings 
SET daily_mode_enabled = true, 
    updated_at = now()
WHERE id = 'global';
```

#### 步骤5：验证结果
```sql
SELECT id, daily_mode_enabled, updated_at 
FROM public.app_settings 
WHERE id = 'global';
```

## 预期结果

### 成功执行后应该看到：
```
id     | daily_mode_enabled | updated_at
-------+--------------------+---------------------
global | true               | 2026-01-28 12:00:00
```

### 检查题目数据应该看到：
如果有从2026-01-21到2026-01-28的题目，会显示类似：
```
id | title       | publish_date | status
---+-------------+--------------+---------
1  | 静夜思      | 2026-01-21   | published
2  | 春晓        | 2026-01-22   | published
...
```

## 常见问题解决

### Q1: 仍然出现权限错误
**解决**：确保您有管理员权限，或者联系项目管理员。

### Q2: question_bank 表也不存在
**解决**：需要先运行 `supabase_admin_setup.sql` 脚本创建题目表结构。

### Q3: 没有题目数据
**解决**：运行以下SQL添加示例题目：

```sql
-- 添加示例题目
INSERT INTO public.question_bank (
    type, title, content, author, dynasty, 
    enabled, language, status, publish_date, published_at
) VALUES 
    ('poem', '静夜思', '静夜思\n床前明月光，疑是地上霜。举头望明月，低头思故乡。', '李白', '唐', 
     true, 'zh-CN', 'published', '2026-01-21', now()),
    ('poem', '春晓', '春晓\n春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '孟浩然', '唐', 
     true, 'zh-CN', 'published', '2026-01-22', now());
-- 继续添加其他日期的题目...
```

### Q4: 题目状态不是 published
**解决**：更新题目状态：
```sql
UPDATE public.question_bank 
SET status = 'published'
WHERE publish_date >= '2026-01-21' 
  AND publish_date <= '2026-01-28';
```

## 测试验证

完成SQL配置后，访问测试页面验证：
1. `http://localhost:8001/test_calendar.html` - 完整功能测试
2. `http://localhost:8001/test_daily_mode.html` - 每日一题模式测试

点击测试按钮，确保所有检查都通过。

## 快速检查命令

### 检查表是否存在
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('app_settings', 'question_bank');
```

### 检查所有设置
```sql
SELECT * FROM public.app_settings;
```

### 检查最近题目
```sql
SELECT id, title, publish_date, status 
FROM public.question_bank 
ORDER BY publish_date DESC 
LIMIT 10;
```