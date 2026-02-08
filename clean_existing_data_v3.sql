-- 数据清洗脚本 v3.1：终极修复版
-- 修复问题：移除不存在的 regexp_quote 函数，使用原生字符串函数处理
-- 功能：移除 content 字段开头的 标题 + (字面量换行符/真实换行符/空白)

UPDATE public.question_bank
SET content = REGEXP_REPLACE(
    SUBSTRING(content FROM LENGTH(title) + 1), -- 第一步：截取掉标题部分（因为WHERE里已经确认是以标题开头）
    '^(\\r\\n|\\n|\\s)+',                      -- 第二步：正则移除开头的字面量\r\n、字面量\n、或真实空白符
    ''                                         -- 替换为空
)
WHERE LEFT(content, LENGTH(title)) = title     -- 确保内容确实以标题开头
AND LENGTH(content) > LENGTH(title)            -- 确保内容长度大于标题，避免处理空内容
AND type = 'poem';
