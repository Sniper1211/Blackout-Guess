-- 修复排期重复问题：确保每一天只有一道题
-- 逻辑：对于每一天，如果存在多道 publish_date 相同的题目，保留 ID 最小的那一道，将其他的 publish_date 置为 NULL (取消排期)

WITH Duplicates AS (
    SELECT 
        id,
        publish_date,
        ROW_NUMBER() OVER (
            PARTITION BY publish_date 
            ORDER BY id ASC
        ) as rn
    FROM 
        public.question_bank
    WHERE 
        publish_date IS NOT NULL
        AND status IN ('published', 'scheduled')
)
UPDATE public.question_bank
SET 
    publish_date = NULL,
    status = 'draft'
WHERE 
    id IN (
        SELECT id 
        FROM Duplicates 
        WHERE rn > 1
    );

-- 验证结果
SELECT publish_date, COUNT(*) 
FROM public.question_bank 
WHERE publish_date IS NOT NULL 
GROUP BY publish_date 
HAVING COUNT(*) > 1;
