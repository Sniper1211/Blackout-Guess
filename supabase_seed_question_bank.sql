-- Blackout-Guess 题库种子脚本
-- 作用：将内置诗词批量导入到 public.question_bank
-- 用法：复制到 Supabase SQL Editor，运行一次即可。
-- 说明：脚本设计为幂等；每条 INSERT 都带有 NOT EXISTS 防重逻辑。

BEGIN;

-- 静夜思（李白）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '静夜思', $$静夜思
床前明月光，疑是地上霜。举头望明月，低头思故乡。$$, '李白', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='静夜思' AND q.author='李白'
);

-- 春晓（孟浩然）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '春晓', $$春晓
春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。$$, '孟浩然', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='春晓' AND q.author='孟浩然'
);

-- 登鹳雀楼（王之涣）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '登鹳雀楼', $$登鹳雀楼
白日依山尽，黄河入海流。欲穷千里目，更上一层楼。$$, '王之涣', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='登鹳雀楼' AND q.author='王之涣'
);

-- 相思（王维）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '相思', $$相思
红豆生南国，春来发几枝。愿君多采撷，此物最相思。$$, '王维', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='相思' AND q.author='王维'
);

-- 江雪（柳宗元）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '江雪', $$江雪
千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。$$, '柳宗元', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='江雪' AND q.author='柳宗元'
);

-- 鹿柴（王维）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '鹿柴', $$鹿柴
空山不见人，但闻人语响。返景入深林，复照青苔上。$$, '王维', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='鹿柴' AND q.author='王维'
);

-- 望庐山瀑布（李白）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '望庐山瀑布', $$望庐山瀑布
日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。$$, '李白', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='望庐山瀑布' AND q.author='李白'
);

-- 早发白帝城（李白）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '早发白帝城', $$早发白帝城
朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。$$, '李白', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='早发白帝城' AND q.author='李白'
);

-- 赠汪伦（李白）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '赠汪伦', $$赠汪伦
李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。$$, '李白', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='赠汪伦' AND q.author='李白'
);

-- 咏鹅（骆宾王）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '咏鹅', $$咏鹅
鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。$$, '骆宾王', '唐代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='咏鹅' AND q.author='骆宾王'
);

-- 水调歌头·明月几时有（苏轼）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '水调歌头·明月几时有', $$水调歌头·明月几时有
明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。
转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。$$, '苏轼', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='水调歌头·明月几时有' AND q.author='苏轼'
);

-- 念奴娇·赤壁怀古（苏轼）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '念奴娇·赤壁怀古', $$念奴娇·赤壁怀古
大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。
遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。$$, '苏轼', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='念奴娇·赤壁怀古' AND q.author='苏轼'
);

-- 声声慢·寻寻觅觅（李清照）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '声声慢·寻寻觅觅', $$声声慢·寻寻觅觅
寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。三杯两盏淡酒，怎敌他、晚来风急？雁过也，正伤心，却是旧时相识。
满地黄花堆积。憔悴损，如今有谁堪摘？守着窗儿，独自怎生得黑？梧桐更兼细雨，到黄昏、点点滴滴。这次第，怎一个愁字了得！$$, '李清照', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='声声慢·寻寻觅觅' AND q.author='李清照'
);

-- 如梦令·常记溪亭日暮（李清照）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '如梦令·常记溪亭日暮', $$如梦令·常记溪亭日暮
常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。$$, '李清照', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='如梦令·常记溪亭日暮' AND q.author='李清照'
);

-- 永遇乐·京口北固亭怀古（辛弃疾）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '永遇乐·京口北固亭怀古', $$永遇乐·京口北固亭怀古
千古江山，英雄无觅，孙仲谋处。舞榭歌台，风流总被，雨打风吹去。斜阳草树，寻常巷陌，人道寄奴曾住。想当年，金戈铁马，气吞万里如虎。
元嘉草草，封狼居胥，赢得仓皇北顾。四十三年，望中犹记，烽火扬州路。可堪回首，佛狸祠下，一片神鸦社鼓。凭谁问，廉颇老矣，尚能饭否？$$, '辛弃疾', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='永遇乐·京口北固亭怀古' AND q.author='辛弃疾'
);

-- 青玉案·元夕（辛弃疾）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '青玉案·元夕', $$青玉案·元夕
东风夜放花千树。更吹落、星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。
蛾儿雪柳黄金缕。笑语盈盈暗香去。众里寻他千百度。蓦然回首，那人却在，灯火阑珊处。$$, '辛弃疾', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='青玉案·元夕' AND q.author='辛弃疾'
);

-- 雨霖铃·寒蝉凄切（柳永）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '雨霖铃·寒蝉凄切', $$雨霖铃·寒蝉凄切
寒蝉凄切，对长亭晚，骤雨初歇。都门帐饮无绪，留恋处，兰舟催发。执手相看泪眼，竟无语凝噎。念去去，千里烟波，暮霭沉沉楚天阔。
多情自古伤离别，更那堪，冷落清秋节！今宵酒醒何处？杨柳岸，晓风残月。此去经年，应是良辰好景虚设。便纵有千种风情，更与何人说？$$, '柳永', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='雨霖铃·寒蝉凄切' AND q.author='柳永'
);

-- 蝶恋花·春景（苏轼）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '蝶恋花·春景', $$蝶恋花·春景
花褪残红青杏小。燕子飞时，绿水人家绕。枝上柳绵吹又少。天涯何处无芳草！
墙里秋千墙外道。墙外行人，墙里佳人笑。笑渐不闻声渐悄。多情却被无情恼。$$, '苏轼', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='蝶恋花·春景' AND q.author='苏轼'
);

-- 江城子·密州出猎（苏轼）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '江城子·密州出猎', $$江城子·密州出猎
老夫聊发少年狂，左牵黄，右擎苍，锦帽貂裘，千骑卷平冈。为报倾城随太守，亲射虎，看孙郎。
酒酣胸胆尚开张。鬓微霜，又何妨！持节云中，何日遣冯唐？会挽雕弓如满月，西北望，射天狼。$$, '苏轼', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='江城子·密州出猎' AND q.author='苏轼'
);

-- 定风波·莫听穿林打叶声（苏轼）
INSERT INTO public.question_bank (type, title, content, author, dynasty, language, enabled)
SELECT 'poem', '定风波·莫听穿林打叶声', $$定风波·莫听穿林打叶声
莫听穿林打叶声，何妨吟啸且徐行。竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。
料峭春风吹酒醒，微冷，山头斜照却相迎。回首向来萧瑟处，归去，也无风雨也无晴。$$, '苏轼', '宋代', 'zh-CN', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_bank q WHERE q.type='poem' AND q.title='定风波·莫听穿林打叶声' AND q.author='苏轼'
);

COMMIT;

-- 可选：为 (type,title,author) 创建唯一索引，避免重复（如需）
-- CREATE UNIQUE INDEX IF NOT EXISTS uk_question_bank_type_title_author
--   ON public.question_bank(type, title, author);