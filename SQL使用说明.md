# SQL使用说明 - 启用每日一题模式

## 1. 访问Supabase控制台
1. 打开 https://app.supabase.com/
2. 登录您的账户
3. 选择对应的项目（URL: `https://bejoqvymupzhtmxjxqvb.supabase.co`）

## 2. 进入SQL编辑器
1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New query** 创建新查询

## 3. 运行SQL语句

### 3.1 启用每日一题模式
```sql
-- 启用每日一题模式
UPDATE public.app_settings 
SET daily_mode_enabled = true, 
    updated_at = now()
WHERE id = 'global';

-- 检查设置是否已更新
SELECT id, daily_mode_enabled, updated_at 
FROM public.app_settings 
WHERE id = 'global';
```

### 3.2 检查题目数据
```sql
-- 检查2026年1月21日到28日的题目
SELECT id, title, publish_date, status, author
FROM public.question_bank
WHERE publish_date >= '2026-01-21' 
  AND publish_date <= '2026-01-28'
  AND status = 'published'
ORDER BY publish_date;
```

### 3.3 如果没有题目数据，添加示例题目
```sql
-- 添加示例题目（需要根据实际情况修改）
INSERT INTO public.question_bank (
    type, title, content, author, dynasty, 
    enabled, language, status, publish_date, published_at
) VALUES 
    ('poem', '静夜思', '静夜思\n床前明月光，疑是地上霜。举头望明月，低头思故乡。', '李白', '唐', 
     true, 'zh-CN', 'published', '2026-01-21', now()),
    ('poem', '春晓', '春晓\n春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '孟浩然', '唐', 
     true, 'zh-CN', 'published', '2026-01-22', now()),
    ('poem', '登鹳雀楼', '登鹳雀楼\n白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', '王之涣', '唐', 
     true, 'zh-CN', 'published', '2026-01-23', now()),
    ('poem', '悯农', '悯农\n锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。', '李绅', '唐', 
     true, 'zh-CN', 'published', '2026-01-24', now()),
    ('poem', '江雪', '江雪\n千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。', '柳宗元', '唐', 
     true, 'zh-CN', 'published', '2026-01-25', now()),
    ('poem', '望庐山瀑布', '望庐山瀑布\n日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '李白', '唐', 
     true, 'zh-CN', 'published', '2026-01-26', now()),
    ('poem', '早发白帝城', '早发白帝城\n朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', '李白', '唐', 
     true, 'zh-CN', 'published', '2026-01-27', now()),
    ('poem', '黄鹤楼送孟浩然之广陵', '黄鹤楼送孟浩然之广陵\n故人西辞黄鹤楼，烟花三月下扬州。孤帆远影碧空尽，唯见长江天际流。', '李白', '唐', 
     true, 'zh-CN', 'published', '2026-01-28', now());
```

## 4. 运行步骤
1. 复制SQL语句到SQL编辑器中
2. 点击 **Run** 按钮执行
3. 查看执行结果

## 5. 验证结果

### 5.1 验证每日一题设置
运行后应该看到：
```
id     | daily_mode_enabled | updated_at
-------+--------------------+---------------------
global | true               | 2026-01-28 12:00:00
```

### 5.2 验证题目数据
运行后应该看到8行数据，每行对应一个日期。

## 6. 常见问题

### Q1: 执行SQL时出现权限错误
**解决方案**：确保您有管理员权限，或者联系项目管理员。

### Q2: 表不存在错误
**解决方案**：先运行初始化脚本 `supabase_app_settings.sql` 和 `supabase_admin_setup.sql`。

### Q3: 日期格式错误
**解决方案**：确保 `publish_date` 格式为 `YYYY-MM-DD`。

### Q4: 题目状态不是published
**解决方案**：将题目状态更新为 `published`：
```sql
UPDATE public.question_bank 
SET status = 'published'
WHERE publish_date >= '2026-01-21' 
  AND publish_date <= '2026-01-28';
```

## 7. 测试连接
完成SQL配置后，访问测试页面验证：
```
http://localhost:8001/test_daily_mode.html
```

点击各个测试按钮，确保所有检查都通过。