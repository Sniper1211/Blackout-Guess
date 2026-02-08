-- 数据清洗脚本 v2：精确修复“标题+正文”重复问题
-- 修复问题：解决 v1 版本中 LIKE 通配符匹配不准确及无法处理 CRLF 的问题

-- 1. 处理 Unix 风格换行符 (\n)
-- 使用 LEFT 函数进行精确字节匹配，避免 LIKE 将 % _ 视为通配符
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 2) -- 跳过 标题长度 + 1个换行符
WHERE LEFT(content, LENGTH(title) + 1) = title || E'\n'
AND type = 'poem';

-- 2. 处理 Windows 风格换行符 (\r\n)
-- 这种情况下需要多跳过一个字符
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 3) -- 跳过 标题长度 + 2个换行符(\r\n)
WHERE LEFT(content, LENGTH(title) + 2) = title || E'\r\n'
AND type = 'poem';

-- 3. 兜底处理：如果标题和正文之间有多余的空格（例如 "标题 \n"）
-- 使用正则表达式移除开头的所有空白字符（直到第一个非空白字符）
-- 仅当开头确实包含标题时才执行，防止误删
UPDATE public.question_bank
SET content = REGEXP_REPLACE(content, '^\s+', '') -- 移除开头的空白字符（包括换行）
WHERE content LIKE title || '%' -- 只有当内容确实以标题开头时（这里用LIKE做初步筛选风险较小，因为后续只是trim空白）
AND LENGTH(content) > LENGTH(title) + 5 -- 确保内容长度足够，避免把只有标题的记录清空
AND type = 'poem';

-- 4. 终极兜底：直接移除那些即使经过上述处理后，依然以标题开头的残留（可能是双重标题等）
-- 比如 content = "标题\n标题\n正文..."
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 2)
WHERE LEFT(content, LENGTH(title) + 1) = title || E'\n'
AND type = 'poem';
