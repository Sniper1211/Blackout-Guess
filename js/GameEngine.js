/**
 * 游戏引擎核心类
 * 负责游戏逻辑、状态管理和数据处理
 */
class GameEngine {
    constructor() {
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
            }
        ];

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
    }

    /**
     * 初始化新游戏
     */
    initGame() {
        this.reset();
        
        // 随机选择游戏内容
        this.currentGame = this.gameData[Math.floor(Math.random() * this.gameData.length)];
        
        // 初始化隐藏文本
        this.hiddenText = this.currentGame.content.split('').map(char => {
            if (/[\u4e00-\u9fa5]/.test(char)) {
                return { char: char, hidden: true };
            } else {
                return { char: char, hidden: false };
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
        
        this.hiddenText.forEach((item, index) => {
            if (item.hidden && item.char === letter) {
                item.hidden = false;
                item.guessedByUser = true;
                found = true;
                foundPositions.push(index);
            }
        });

        // 检查游戏状态
        const titleComplete = this.checkTitleComplete();
        const gameComplete = this.checkGameComplete();

        let result = {
            success: found,
            message: found ? `找到了 ${letter}！` : `文章中没有 "${letter}"`,
            type: found ? 'success' : 'error',
            foundPositions,
            titleComplete,
            gameComplete,
            score: this.calculateScore()
        };

        if (titleComplete && !this.titleGuessedNotified) {
            this.revealAllText();
            this.titleGuessedNotified = true;
            result.titleComplete = true;
            // 标题完成后，游戏也算完成
            this.gameWon = true;
            result.gameComplete = true;
        }

        if (gameComplete) {
            this.gameWon = true;
            result.gameComplete = true;
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
            }
        });
    }

    /**
     * 计算分数
     */
    calculateScore() {
        if (this.startTime === 0) return 0;

        const elapsedTime = this.getElapsedTime();
        
        const baseScore = 1000;
        const timeDeduction = Math.min(500, elapsedTime * 2);
        const guessDeduction = this.guessCount * 10;
        const hintPenalty = this.hintUsed ? 100 : 0;
        
        this.currentScore = Math.max(0, Math.floor(
            baseScore - timeDeduction - guessDeduction - hintPenalty
        ));
        
        return this.currentScore;
    }

    /**
     * 使用提示
     */
    useHint() {
        if (this.hintUsed || this.gameWon) {
            return { success: false, message: '提示已用完或游戏已结束' };
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
            }
        });

        this.hintUsed = true;
        return { 
            success: true, 
            message: `提示：显示了字符 "${hintChar.char}"`,
            hintChar: hintChar.char
        };
    }

    /**
     * 获取游戏状态用于保存
     */
    getGameState() {
        return {
            currentGameIndex: this.gameData.findIndex(game => game.title === this.currentGame?.title),
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
            if (gameState.currentGameIndex >= 0 && gameState.currentGameIndex < this.gameData.length) {
                this.currentGame = this.gameData[gameState.currentGameIndex];
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