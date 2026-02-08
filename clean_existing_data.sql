-- 数据清洗脚本：修复已插入的正文中包含标题重复的问题
-- 将形如 "标题\n正文..." 的内容更新为 "正文..."

-- 1. 更新 question_bank 表中 content 以 title + '\n' 开头的记录
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 2) -- +2 是因为要去掉换行符
WHERE content LIKE title || E'\n%' -- 匹配 "标题\n..."
AND type = 'poem'; -- 仅针对诗词类型

-- 2. 移除内容开头的多余空白字符（可选）
UPDATE public.question_bank
SET content = TRIM(LEADING E'\n' FROM TRIM(content))
WHERE type = 'poem';
