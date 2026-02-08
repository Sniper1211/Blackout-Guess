/**
 * 游戏引擎核心类
 * 负责游戏逻辑、状态管理和数据处理
 */
class GameEngine {
    constructor() {
        // 题库数据由外部（Supabase）提供
        this.gameData = [
            {
                title: "静夜思",
                content: "静夜思\n床前明月光，疑是地上霜。举头望明月，低头思故乡。",
                author: "李白",
                dynasty: "唐代"
            },
            {
                title: "春晓",
                content: "春晓\n春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
                author: "孟浩然",
                dynasty: "唐代"
            },
            {
                title: "登鹳雀楼",
                content: "登鹳雀楼\n白日依山尽，黄河入海流。欲穷千里目，更上一层楼。",
                author: "王之涣",
                dynasty: "唐代"
            },
            {
                title: "相思",
                content: "相思\n红豆生南国，春来发几枝。愿君多采撷，此物最相思。",
                author: "王维",
                dynasty: "唐代"
            },
            {
                title: "江雪",
                content: "江雪\n千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。",
                author: "柳宗元",
                dynasty: "唐代"
            },
            {
                title: "鹿柴",
                content: "鹿柴\n空山不见人，但闻人语响。返景入深林，复照青苔上。",
                author: "王维",
                dynasty: "唐代"
            },
            {
                title: "望庐山瀑布",
                content: "望庐山瀑布\n日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。",
                author: "李白",
                dynasty: "唐代"
            },
            {
                title: "早发白帝城",
                content: "早发白帝城\n朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。",
                author: "李白",
                dynasty: "唐代"
            },
            {
                title: "赠汪伦",
                content: "赠汪伦\n李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。",
                author: "李白",
                dynasty: "唐代"
            },
            {
                title: "咏鹅",
                content: "咏鹅\n鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。",
                author: "骆宾王",
                dynasty: "唐代"
            },
            // 宋词作品
            {
                title: "水调歌头·明月几时有",
                content: "水调歌头·明月几时有\n明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。\n转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。",
                author: "苏轼",
                dynasty: "宋代"
            },
            {
                title: "念奴娇·赤壁怀古",
                content: "念奴娇·赤壁怀古\n大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。\n遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。",
                author: "苏轼",
                dynasty: "宋代"
            },
            {
                title: "声声慢·寻寻觅觅",
                content: "声声慢·寻寻觅觅\n寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。三杯两盏淡酒，怎敌他、晚来风急？雁过也，正伤心，却是旧时相识。\n满地黄花堆积。憔悴损，如今有谁堪摘？守着窗儿，独自怎生得黑？梧桐更兼细雨，到黄昏、点点滴滴。这次第，怎一个愁字了得！",
                author: "李清照",
                dynasty: "宋代"
            },
            {
                title: "如梦令·常记溪亭日暮",
                content: "如梦令·常记溪亭日暮\n常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。",
                author: "李清照",
                dynasty: "宋代"
            },
            {
                title: "永遇乐·京口北固亭怀古",
                content: "永遇乐·京口北固亭怀古\n千古江山，英雄无觅，孙仲谋处。舞榭歌台，风流总被，雨打风吹去。斜阳草树，寻常巷陌，人道寄奴曾住。想当年，金戈铁马，气吞万里如虎。\n元嘉草草，封狼居胥，赢得仓皇北顾。四十三年，望中犹记，烽火扬州路。可堪回首，佛狸祠下，一片神鸦社鼓。凭谁问，廉颇老矣，尚能饭否？",
                author: "辛弃疾",
                dynasty: "宋代"
            },
            {
                title: "青玉案·元夕",
                content: "青玉案·元夕\n东风夜放花千树。更吹落、星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。\n蛾儿雪柳黄金缕。笑语盈盈暗香去。众里寻他千百度。蓦然回首，那人却在，灯火阑珊处。",
                author: "辛弃疾",
                dynasty: "宋代"
            },
            {
                title: "雨霖铃·寒蝉凄切",
                content: "雨霖铃·寒蝉凄切\n寒蝉凄切，对长亭晚，骤雨初歇。都门帐饮无绪，留恋处，兰舟催发。执手相看泪眼，竟无语凝噎。念去去，千里烟波，暮霭沉沉楚天阔。\n多情自古伤离别，更那堪，冷落清秋节！今宵酒醒何处？杨柳岸，晓风残月。此去经年，应是良辰好景虚设。便纵有千种风情，更与何人说？",
                author: "柳永",
                dynasty: "宋代"
            },
            {
                title: "蝶恋花·春景",
                content: "蝶恋花·春景\n花褪残红青杏小。燕子飞时，绿水人家绕。枝上柳绵吹又少。天涯何处无芳草！\n墙里秋千墙外道。墙外行人，墙里佳人笑。笑渐不闻声渐悄。多情却被无情恼。",
                author: "苏轼",
                dynasty: "宋代"
            },
            {
                title: "江城子·密州出猎",
                content: "江城子·密州出猎\n老夫聊发少年狂，左牵黄，右擎苍，锦帽貂裘，千骑卷平冈。为报倾城随太守，亲射虎，看孙郎。\n酒酣胸胆尚开张。鬓微霜，又何妨！持节云中，何日遣冯唐？会挽雕弓如满月，西北望，射天狼。",
                author: "苏轼",
                dynasty: "宋代"
            },
            {
                title: "定风波·莫听穿林打叶声",
                content: "定风波·莫听穿林打叶声\n莫听穿林打叶声，何妨吟啸且徐行。竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。\n料峭春风吹酒醒，微冷，山头斜照却相迎。回首向来萧瑟处，归去，也无风雨也无晴。",
                author: "苏轼",
                dynasty: "宋代"
            },
            // 2026-02-09 新增 50 首精选诗词 (v2)
            {
                title: "悯农",
                content: "悯农\n锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。",
                author: "李绅",
                dynasty: "唐代"
            },
            {
                title: "游子吟",
                content: "游子吟\n慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。",
                author: "孟郊",
                dynasty: "唐代"
            },
            {
                title: "赋得古原草送别",
                content: "赋得古原草送别\n离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。远芳侵古道，晴翠接荒城。又送王孙去，萋萋满别情。",
                author: "白居易",
                dynasty: "唐代"
            },
            {
                title: "清明",
                content: "清明\n清明时节雨纷纷，路上行人欲断魂。借问酒家何处有？牧童遥指杏花村。",
                author: "杜牧",
                dynasty: "唐代"
            },
            {
                title: "山行",
                content: "山行\n远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。",
                author: "杜牧",
                dynasty: "唐代"
            },
            {
                title: "题西林壁",
                content: "题西林壁\n横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。",
                author: "苏轼",
                dynasty: "宋代"
            },
            {
                title: "饮湖上初晴后雨",
                content: "饮湖上初晴后雨\n水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。",
                author: "苏轼",
                dynasty: "宋代"
            },
            {
                title: "示儿",
                content: "示儿\n死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。",
                author: "陆游",
                dynasty: "宋代"
            },
            {
                title: "满江红",
                content: "满江红\n怒发冲冠，凭栏处、潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切。\n靖康耻，犹未雪。臣子恨，何时灭！驾长车，踏破贺兰山缺。壮志饥餐胡虏肉，笑谈渴饮匈奴血。待从头、收拾旧山河，朝天阙。",
                author: "岳飞",
                dynasty: "宋代"
            },
            {
                title: "虞美人",
                content: "虞美人\n春花秋月何时了？往事知多少。小楼昨夜又东风，故国不堪回首月明中。\n雕栏玉砌应犹在，只是朱颜改。问君能有几多愁？恰似一江春水向东流。",
                author: "李煜",
                dynasty: "五代"
            },
            {
                title: "浪淘沙",
                content: "浪淘沙\n帘外雨潺潺，春意阑珊。罗衾不耐五更寒。梦里不知身是客，一晌贪欢。\n独自莫凭栏，无限江山。别时容易见时难。流水落花春去也，天上人间。",
                author: "李煜",
                dynasty: "五代"
            },
            {
                title: "忆江南",
                content: "忆江南\n江南好，风景旧曾谙。日出江花红胜火，春来江水绿如蓝。能不忆江南？",
                author: "白居易",
                dynasty: "唐代"
            },
            {
                title: "敕勒歌",
                content: "敕勒歌\n敕勒川，阴山下。天似穹庐，笼盖四野。天苍苍，野茫茫。风吹草低见牛羊。",
                author: "北朝民歌",
                dynasty: "南北朝"
            },
            {
                title: "凉州词",
                content: "凉州词\n葡萄美酒夜光杯，欲饮琵琶马上催。醉卧沙场君莫笑，古来征战几人回？",
                author: "王翰",
                dynasty: "唐代"
            },
            {
                title: "出塞",
                content: "出塞\n秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。",
                author: "王昌龄",
                dynasty: "唐代"
            },
            {
                title: "芙蓉楼送辛渐",
                content: "芙蓉楼送辛渐\n寒雨连江夜入吴，平明送客楚山孤。洛阳亲友如相问，一片冰心在玉壶。",
                author: "王昌龄",
                dynasty: "唐代"
            },
            {
                title: "别董大",
                content: "别董大\n千里黄云白日勋，北风吹雁雪纷纷。莫愁前路无知己，天下谁人不识君？",
                author: "高适",
                dynasty: "唐代"
            },
            {
                title: "枫桥夜泊",
                content: "枫桥夜泊\n月落乌啼霜满天，江枫渔火对愁眠。姑苏城外寒山寺，夜半钟声到客船。",
                author: "张继",
                dynasty: "唐代"
            },
            {
                title: "乌衣巷",
                content: "乌衣巷\n朱雀桥边野草花，乌衣巷口夕阳斜。旧时王谢堂前燕，飞入寻常百姓家。",
                author: "刘禹锡",
                dynasty: "唐代"
            },
            {
                title: "泊船瓜洲",
                content: "泊船瓜洲\n京口瓜洲一水间，钟山只隔数重山。春风又绿江南岸，明月何时照我还？",
                author: "王安石",
                dynasty: "宋代"
            },
            {
                title: "春望",
                content: "春望\n国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。",
                author: "杜甫",
                dynasty: "唐代"
            },
            {
                title: "绝句",
                content: "绝句\n两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。",
                author: "杜甫",
                dynasty: "唐代"
            },
            {
                title: "望岳",
                content: "望岳\n岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。",
                author: "杜甫",
                dynasty: "唐代"
            },
            {
                title: "闻官军收河南河北",
                content: "闻官军收河南河北\n剑外忽传收蓟北，初闻涕泪满衣裳。却看妻子愁何在，漫卷诗书喜欲狂。白日放歌须纵酒，青春作伴好还乡。即从巴峡穿巫峡，便下襄阳向洛阳。",
                author: "杜甫",
                dynasty: "唐代"
            },
            {
                title: "九月九日忆山东兄弟",
                content: "九月九日忆山东兄弟\n独在异乡为异客，每逢佳节倍思亲。遥知兄弟登高处，遍插茱萸少一人。",
                author: "王维",
                dynasty: "唐代"
            },
            {
                title: "送元二使安西",
                content: "送元二使安西\n渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。",
                author: "王维",
                dynasty: "唐代"
            },
            {
                title: "杂诗",
                content: "杂诗\n君自故乡来，应知故乡事。来日绮窗前，寒梅著花未？",
                author: "王维",
                dynasty: "唐代"
            },
            {
                title: "凉州词",
                content: "凉州词\n黄河远上白云间，一片孤城万仞山。羌笛何须怨杨柳，春风不度玉门关。",
                author: "王之涣",
                dynasty: "唐代"
            },
            {
                title: "登幽州台歌",
                content: "登幽州台歌\n前不见古人，后不见来者。念天地之悠悠，独怆然而涕下。",
                author: "陈子昂",
                dynasty: "唐代"
            },
            {
                title: "回乡偶书",
                content: "回乡偶书\n少小离家老大回，乡音无改鬓毛衰。儿童相见不相识，笑问客从何处来。",
                author: "贺知章",
                dynasty: "唐代"
            },
            {
                title: "黄鹤楼",
                content: "黄鹤楼\n昔人已乘黄鹤去，此地空余黄鹤楼。黄鹤一去不复返，白云千载空悠悠。晴川历历汉阳树，芳草萋萋鹦鹉洲。日暮乡关何处是？烟波江上使人愁。",
                author: "崔颢",
                dynasty: "唐代"
            },
            {
                title: "望洞庭",
                content: "望洞庭\n湖光秋月两相和，潭面无风镜未磨。遥望洞庭山水翠，白银盘里一青螺。",
                author: "刘禹锡",
                dynasty: "唐代"
            },
            {
                title: "乐游原",
                content: "乐游原\n向晚意不适，驱车登古原。夕阳无限好，只是近黄昏。",
                author: "李商隐",
                dynasty: "唐代"
            },
            {
                title: "夜雨寄北",
                content: "夜雨寄北\n君问归期未有期，巴山夜雨涨秋池。何当共剪西窗烛，却话巴山夜雨时。",
                author: "李商隐",
                dynasty: "唐代"
            },
            {
                title: "无题",
                content: "无题\n相见时难别亦难，东风无力百花残。春蚕到死丝方尽，蜡炬成灰泪始干。晓镜但愁云鬓改，夜吟应觉月光寒。蓬山此去无多路，青鸟殷勤为探看。",
                author: "李商隐",
                dynasty: "唐代"
            },
            {
                title: "锦瑟",
                content: "锦瑟\n锦瑟无端五十弦，一弦一柱思华年。庄生晓梦迷蝴蝶，望帝春心托杜鹃。沧海月明珠有泪，蓝田日暖玉生烟。此情可待成追忆，只是当时已惘然。",
                author: "李商隐",
                dynasty: "唐代"
            },
            {
                title: "江南春",
                content: "江南春\n千里莺啼绿映红，水村山郭酒旗风。南朝四百八十寺，多少楼台烟雨中。",
                author: "杜牧",
                dynasty: "唐代"
            },
            {
                title: "秋夕",
                content: "秋夕\n银烛秋光冷画屏，轻罗小扇扑流萤。天阶夜色凉如水，卧看牵牛织女星。",
                author: "杜牧",
                dynasty: "唐代"
            },
            {
                title: "渔歌子",
                content: "渔歌子\n西塞山前白鹭飞，桃花流水鳜鱼肥。青箬笠，绿蓑衣，斜风细雨不须归。",
                author: "张志和",
                dynasty: "唐代"
            },
            {
                title: "长相思",
                content: "长相思\n山一程，水一程，身向榆关那畔行，夜深千帐灯。风一更，雪一更，聒碎乡心梦不成，故园无此声。",
                author: "纳兰性德",
                dynasty: "清代"
            },
            {
                title: "己亥杂诗",
                content: "己亥杂诗\n浩荡离愁白日斜，吟鞭东指即天涯。落红不是无情物，化作春泥更护花。",
                author: "龚自珍",
                dynasty: "清代"
            },
            {
                title: "竹石",
                content: "竹石\n咬定青山不放松，立根原在破岩中。千磨万击还坚劲，任尔东西南北风。",
                author: "郑燮",
                dynasty: "清代"
            },
            {
                title: "石灰吟",
                content: "石灰吟\n千锤万凿出深山，烈火焚烧若等闲。粉骨碎身浑不怕，要留清白在人间。",
                author: "于谦",
                dynasty: "明代"
            },
            {
                title: "墨梅",
                content: "墨梅\n我家洗砚池头树，朵朵花开淡墨痕。不要人夸颜色好，只留清气满乾坤。",
                author: "王冕",
                dynasty: "元代"
            },
            {
                title: "天净沙·秋思",
                content: "天净沙·秋思\n枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。",
                author: "马致远",
                dynasty: "元代"
            },
            {
                title: "山坡羊·潼关怀古",
                content: "山坡羊·潼关怀古\n峰峦如聚，波涛如怒，山河表里潼关路。望西都，意踌躇。伤心秦汉经行处，宫阙万间都做了土。兴，百姓苦；亡，百姓苦。",
                author: "张养浩",
                dynasty: "元代"
            },
            {
                title: "破阵子·为陈同甫赋壮词以寄之",
                content: "破阵子·为陈同甫赋壮词以寄之\n醉里挑灯看剑，梦回吹角连营。八百里分麾下炙，五十弦翻塞外声，沙场秋点兵。\n马作的卢飞快，弓如霹雳弦惊。了却君王天下事，赢得生前身后名。可怜白发生！",
                author: "辛弃疾",
                dynasty: "宋代"
            },
            {
                title: "渔家傲·秋思",
                content: "渔家傲·秋思\n塞下秋来风景异，衡阳雁去无留意。四面边声连角起，千嶂里，长烟落日孤城闭。\n浊酒一杯家万里，燕然未勒归无计。羌管悠悠霜满地，人不寐，将军白发征夫泪。",
                author: "范仲淹",
                dynasty: "宋代"
            },
            {
                title: "醉花阴",
                content: "醉花阴\n薄雾浓云愁永昼，瑞脑销金兽。佳节又重阳，玉枕纱厨，半夜凉初透。\n东篱把酒黄昏后，有暗香盈袖。莫道不销魂，帘卷西风，人比黄花瘦。",
                author: "李清照",
                dynasty: "宋代"
            },
            {
                title: "七步诗",
                content: "七步诗\n煮豆燃豆萁，豆在釜中泣。本是同根生，相煎何太急？",
                author: "曹植",
                dynasty: "魏晋"
            }
        ];
        // 移除内置数据：改为空数组，由 App 加载在线题库填充
        // this.gameData = [];

        this.reset();
    }

    /**
     * 重置游戏状态
     */
    reset() {
        this.currentGame = null;
        this.hiddenText = [];
        this.guessedLetters = new Set();
        this.guessCount = 0;
        this.gameWon = false;
        this.startTime = 0;
        this.currentScore = 0;
        this.titleGuessedNotified = false;
        this.hintUsed = false;
        
        // 新积分系统相关属性
        this.consecutiveHits = 0; // 当前连击数
        this.maxConsecutiveHits = 0; // 最大连击数
        this.correctGuesses = 0; // 正确猜测数
        this.wrongGuesses = 0; // 错误猜测数
        this.hintCount = 0; // 使用提示次数
        this.scoreBreakdown = { // 分数明细
            base: 500,
            characters: 0,
            combo: 0,
            speed: 0,
            accuracy: 0,
            strategy: 0,
            achievements: 0,
            penalties: 0
        };
        
        // 常用字列表（用于计分）
        this.commonChars = new Set(['的', '了', '在', '是', '有', '我', '他', '她', '它', '这', '那', '一', '不', '人', '上', '下', '大', '小', '中', '来', '去', '说', '要', '会', '能', '可', '就', '都', '也', '还', '又', '和', '与', '或', '但', '而', '因', '为', '所', '以', '从', '到', '把', '被', '让', '使', '给', '对', '向', '往', '于', '在', '里', '外', '前', '后', '左', '右', '东', '西', '南', '北', '年', '月', '日', '时', '分', '秒', '今', '明', '昨', '早', '晚', '白', '黑', '红', '绿', '蓝', '黄', '紫', '好', '坏', '新', '旧', '多', '少', '高', '低', '长', '短', '快', '慢', '热', '冷', '干', '湿', '美', '丑', '爱', '恨', '喜', '怒', '哀', '乐']);
    }

    /**
     * 初始化新游戏
     */
    initGame() {
        this.reset();
        
        // 无题库数据时安全退出，避免报错
        if (!Array.isArray(this.gameData) || this.gameData.length === 0) {
            this.currentGame = null;
            this.hiddenText = [];
            return false;
        }
        
        // 随机选择游戏内容
        this.currentGame = this.gameData[Math.floor(Math.random() * this.gameData.length)];
        
        // 初始化隐藏文本
        this.hiddenText = this.currentGame.content.split('').map(char => {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                return { char: char, hidden: true, revealType: null };
            } else {
                return { char: char, hidden: false, revealType: null };
            }
        });
    }

    /**
     * 开始计时
     */
    startTimer() {
        if (this.startTime === 0) {
            this.startTime = Date.now();
        }
    }

    /**
     * 获取游戏用时（秒）
     */
    getElapsedTime() {
        return this.startTime > 0 ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    }

    /**
     * 格式化时间显示
     */
    getFormattedTime() {
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 猜测字符
     * @param {string} letter - 猜测的字符
     * @returns {Object} 猜测结果
     */
    guessLetter(letter) {
        if (this.gameWon) {
            return { success: false, message: '游戏已结束', type: 'info' };
        }

        // 输入验证
        if (!letter || !letter.trim()) {
            return { success: false, message: '请输入一个汉字！', type: 'error' };
        }

        if (!/[\u4e00-\u9fa5]/.test(letter)) {
            return { success: false, message: '请输入汉字！', type: 'error' };
        }

        if (this.guessedLetters.has(letter)) {
            return { success: false, message: '已经猜过这个字了！', type: 'error' };
        }

        // 开始计时
        this.startTimer();

        // 记录猜测
        this.guessCount++;
        this.guessedLetters.add(letter);

        // 检查是否猜中
        let found = false;
        const foundPositions = [];
        let foundCount = 0;
        
        this.hiddenText.forEach((item, index) => {
            if (item.hidden && item.char === letter) {
                item.hidden = false;
                item.guessedByUser = true;
                item.revealType = 'user'; // 标记为用户猜测
                found = true;
                foundCount++;
                foundPositions.push(index);
            }
        });

        // 更新连击和统计
        if (found) {
            this.correctGuesses++;
            this.consecutiveHits++;
            this.maxConsecutiveHits = Math.max(this.maxConsecutiveHits, this.consecutiveHits);
        } else {
            this.wrongGuesses++;
            this.consecutiveHits = 0; // 重置连击
        }

        // 检查游戏状态
        const titleComplete = this.checkTitleComplete();
        const gameComplete = this.checkGameComplete();

        // 计算得分和奖励信息
        const scoreInfo = this.calculateScore();
        
        let message = found ? `找到了 ${letter}！` : `文章中没有 "${letter}"`;
        let bonusMessage = '';
        
        if (found) {
            if (foundCount > 1) {
                bonusMessage += ` 找到${foundCount}个字符！`;
            }
            if (this.consecutiveHits >= 2) {
                bonusMessage += ` ${this.consecutiveHits}连击！`;
            }
        }

        let result = {
            success: found,
            message: message + bonusMessage,
            type: found ? 'success' : 'error',
            foundPositions,
            foundCount,
            consecutiveHits: this.consecutiveHits,
            titleComplete,
            gameComplete,
            score: scoreInfo.total,
            scoreBreakdown: scoreInfo.breakdown,
            bonusPoints: scoreInfo.lastBonus
        };

        if (titleComplete && !this.titleGuessedNotified) {
            this.revealAllText();
            this.titleGuessedNotified = true;
            result.titleComplete = true;
            // 标题完成后，游戏也算完成
            this.gameWon = true;
            result.gameComplete = true;
            // 重新计算最终分数
            const finalScore = this.calculateScore();
            result.score = finalScore.total;
            result.scoreBreakdown = finalScore.breakdown;
        }

        if (gameComplete) {
            this.gameWon = true;
            result.gameComplete = true;
            // 重新计算最终分数
            const finalScore = this.calculateScore();
            result.score = finalScore.total;
            result.scoreBreakdown = finalScore.breakdown;
        }

        return result;
    }

    /**
     * 检查标题是否完全猜出
     */
    checkTitleComplete() {
        const titleChars = [];
        for (let i = 0; i < this.hiddenText.length; i++) {
            if (this.hiddenText[i].char === '\n') break;
            titleChars.push(this.hiddenText[i]);
        }
        return titleChars.every(item => !item.hidden);
    }

    /**
     * 检查游戏是否完成
     */
    checkGameComplete() {
        return this.hiddenText.every(item => !item.hidden);
    }

    /**
     * 显示所有文字
     */
    revealAllText() {
        this.hiddenText.forEach(item => {
            if (item.hidden) {
                item.hidden = false;
                item.guessedByUser = false; // 系统显示的字
                item.revealType = 'auto';   // 标记为自动揭示
            }
        });
    }

    /**
     * 计算分数 - 新积分规则
     */
    calculateScore() {
        if (this.startTime === 0) {
            return { total: 500, breakdown: this.scoreBreakdown, lastBonus: 0 };
        }

        const elapsedTime = this.getElapsedTime();
        let lastBonus = 0; // 本次操作获得的奖励分数
        
        // 重置分数明细
        this.scoreBreakdown = {
            base: 500,
            characters: 0,
            combo: 0,
            speed: 0,
            accuracy: 0,
            strategy: 0,
            achievements: 0,
            penalties: 0
        };

        // 1. 基础分数（保底）
        let totalScore = this.scoreBreakdown.base;

        // 2. 字符得分
        this.guessedLetters.forEach(letter => {
            let charScore = 30; // 默认分数
            if (this.commonChars.has(letter)) {
                charScore = 20; // 常用字
            } else if (this.isRareChar(letter)) {
                charScore = 50; // 生僻字
            }
            this.scoreBreakdown.characters += charScore;
        });

        // 3. 连击奖励
        if (this.maxConsecutiveHits >= 2) {
            let comboBonus = 0;
            if (this.maxConsecutiveHits === 2) comboBonus = 30;
            else if (this.maxConsecutiveHits === 3) comboBonus = 60;
            else if (this.maxConsecutiveHits === 4) comboBonus = 100;
            else if (this.maxConsecutiveHits >= 5) comboBonus = 150;
            
            this.scoreBreakdown.combo = comboBonus;
            
            // 如果当前正在连击，这是本次的奖励
            if (this.consecutiveHits >= 2) {
                if (this.consecutiveHits === 2) lastBonus += 30;
                else if (this.consecutiveHits === 3) lastBonus += 30; // 60-30
                else if (this.consecutiveHits === 4) lastBonus += 40; // 100-60
                else if (this.consecutiveHits >= 5) lastBonus += 50; // 150-100
            }
        }

        // 检查完美连击（一次性猜完所有字符）
        const totalChars = this.hiddenText.filter(item => /[\u4e00-\u9fa5]/.test(item.char)).length;
        if (this.gameWon && this.correctGuesses === totalChars && this.wrongGuesses === 0) {
            this.scoreBreakdown.combo += 300;
            if (this.consecutiveHits === totalChars) {
                lastBonus += 300;
            }
        }

        // 4. 速度奖励
        if (this.gameWon) {
            if (elapsedTime <= 30) {
                this.scoreBreakdown.speed = 200;
            } else if (elapsedTime <= 60) {
                this.scoreBreakdown.speed = 150;
            } else if (elapsedTime <= 120) {
                this.scoreBreakdown.speed = 100;
            } else if (elapsedTime <= 180) {
                this.scoreBreakdown.speed = 50;
            }
        }

        // 5. 准确度奖励
        if (this.guessCount > 0) {
            const accuracy = this.correctGuesses / this.guessCount;
            if (accuracy >= 0.9) {
                this.scoreBreakdown.accuracy = 150;
            } else if (accuracy >= 0.8) {
                this.scoreBreakdown.accuracy = 100;
            } else if (accuracy >= 0.7) {
                this.scoreBreakdown.accuracy = 50;
            }
        }

        // 6. 策略奖励
        if (this.gameWon) {
            if (this.hintCount === 0) {
                this.scoreBreakdown.strategy = 200; // 不使用提示
            } else if (this.hintCount === 1) {
                this.scoreBreakdown.strategy = 100; // 仅使用1次提示
            }
        }

        // 7. 成就奖励
        if (this.gameWon) {
            // 检查标题完成奖励
            if (this.checkTitleComplete()) {
                this.scoreBreakdown.achievements += 100;
            }
            
            // 检查一次猜对多个字符的奖励
            // 这个在guessLetter中实时计算
        }

        // 8. 惩罚
        this.scoreBreakdown.penalties = -(this.hintCount * 30); // 每次提示-30分
        if (this.wrongGuesses >= 3) {
            this.scoreBreakdown.penalties -= 20; // 连续猜错3次-20分
        }

        // 计算总分
        totalScore = this.scoreBreakdown.base + 
                    this.scoreBreakdown.characters + 
                    this.scoreBreakdown.combo + 
                    this.scoreBreakdown.speed + 
                    this.scoreBreakdown.accuracy + 
                    this.scoreBreakdown.strategy + 
                    this.scoreBreakdown.achievements + 
                    this.scoreBreakdown.penalties;

        this.currentScore = Math.max(500, Math.floor(totalScore)); // 最低500分

        return {
            total: this.currentScore,
            breakdown: { ...this.scoreBreakdown },
            lastBonus: lastBonus
        };
    }

    /**
     * 判断是否为生僻字
     */
    isRareChar(char) {
        // 简单的生僻字判断，可以根据需要扩展
        const rareChars = new Set(['霜', '鹳', '蓑', '撷', '琼', '楼', '宇', '绮', '户', '婵', '娟', '樯', '橹', '酹', '纶', '巾', '凄', '戚', '憔', '悴', '梧', '桐', '滴', '寻', '觅', '惨', '凄', '将', '息', '敌', '雁', '识', '堆', '积', '损', '摘', '怎', '生', '兼', '黄', '昏', '次', '第', '愁']);
        return rareChars.has(char);
    }

    /**
     * 使用提示
     */
    useHint() {
        if (this.gameWon) {
            return { success: false, message: '游戏已结束' };
        }

        if (this.hintUsed) {
            return { success: false, message: '提示次数已用完' };
        }

        const hiddenChars = this.hiddenText.filter(item => item.hidden);
        if (hiddenChars.length === 0) {
            return { success: false, message: '没有需要提示的字符' };
        }

        // 随机显示一个隐藏字符
        const randomIndex = Math.floor(Math.random() * hiddenChars.length);
        const hintChar = hiddenChars[randomIndex];
        
        // 找到该字符在原文中的位置并显示
        this.hiddenText.forEach(item => {
            if (item.hidden && item.char === hintChar.char) {
                item.hidden = false;
                item.guessedByUser = false; // 标记为系统提示
                item.revealType = 'hint';   // 标记为提示揭示
            }
        });

        this.hintCount++;
        this.hintUsed = true; // 保持兼容性
        
        // 重置连击（使用提示会中断连击）
        this.consecutiveHits = 0;
        
        return { 
            success: true, 
            message: `提示：显示了字符 "${hintChar.char}" (-30分)`,
            hintChar: hintChar.char,
            score: this.calculateScore().total
        };
    }

    /**
     * 获取游戏状态用于保存
     */
    getGameState() {
        return {
            title: this.currentGame?.title, // 保存题目名称以便验证
            hiddenText: this.hiddenText,
            guessedLetters: Array.from(this.guessedLetters),
            guessCount: this.guessCount,
            startTime: this.startTime,
            currentScore: this.currentScore,
            titleGuessedNotified: this.titleGuessedNotified,
            hintUsed: this.hintUsed
        };
    }

    /**
     * 从保存的状态恢复游戏
     */
    loadGameState(gameState) {
        try {
            // 验证题目名称是否匹配，如果不匹配则不恢复进度
            if (gameState && this.currentGame && gameState.title === this.currentGame.title) {
                this.hiddenText = gameState.hiddenText || [];
                this.guessedLetters = new Set(gameState.guessedLetters || []);
                this.guessCount = gameState.guessCount || 0;
                this.startTime = gameState.startTime || 0;
                this.currentScore = gameState.currentScore || 0;
                this.titleGuessedNotified = gameState.titleGuessedNotified || false;
                this.hintUsed = gameState.hintUsed || false;
                return true;
            }
        } catch (error) {
            console.error('加载游戏状态失败:', error);
        }
        return false;
    }
}

// 导出类
window.GameEngine = GameEngine;
