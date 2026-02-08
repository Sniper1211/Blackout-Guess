-- 数据清洗脚本 v3：终极修复版
-- 针对：数据库中存储的是字面量字符串 "\n" (即反斜杠+n, 两个字符) 而非真实换行符的情况
-- 这通常发生在数据导入时转义处理不当

-- 1. 处理字面量 "\n" (反斜杠 + n)
-- 匹配逻辑：标题 + 字面量\n + 任意内容
-- 截取逻辑：跳过 标题长度 + 2 (因为 \n 是两个字符)
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 3)
WHERE content LIKE title || '\\n%' 
AND type = 'poem';

-- 2. 处理字面量 "\r\n" (反斜杠+r+反斜杠+n) - 较少见但以防万一
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 5) -- \r\n 是4个字符
WHERE content LIKE title || '\\r\\n%'
AND type = 'poem';

-- 3. 处理真实换行符 (再跑一次以防漏网)
UPDATE public.question_bank
SET content = SUBSTRING(content FROM LENGTH(title) + 2)
WHERE LEFT(content, LENGTH(title) + 1) = title || E'\n'
AND type = 'poem';

-- 4. 暴力兜底：如果有 "标题\n" (字面量) 但后面紧跟正文的情况
-- 使用正则替换：将开头的 "标题" + 可能的转义换行符 + 可能的空白 替换为空
UPDATE public.question_bank
SET content = REGEXP_REPLACE(content, '^' || regexp_quote(title) || '(\\n|\\\\n|\\s)+', '')
WHERE content LIKE title || '%'
AND LENGTH(content) > LENGTH(title) + 5
AND type = 'poem';
