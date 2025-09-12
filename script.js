// 游戏数据
const gameData = [
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
    }
];

// 游戏状态变量
let currentGame = null;
let hiddenText = [];
let guessedLetters = new Set();
let guessCount = 0;
let gameWon = false;
let startTime = 0;
let timerInterval = null;
let currentScore = 0;
let difficulty = 'medium'; // 默认难度
let titleGuessedNotified = false; // 标题猜出提示标志

// DOM 元素
const elements = {
    textDisplay: document.getElementById('textDisplay'),
    letterInput: document.getElementById('letterInput'),
    message: document.getElementById('message'),
    guessCount: document.getElementById('guessCount'),
    guessedLetters: document.getElementById('guessedLetters'),
    winMessage: document.getElementById('winMessage'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    difficultySelector: document.getElementById('difficultySelector'),
    themeToggle: document.getElementById('themeToggle')
};

// 初始化游戏
function initGame() {
    // 随机选择一个游戏数据
    currentGame = gameData[Math.floor(Math.random() * gameData.length)];
    
    // 初始化隐藏文本数组
    hiddenText = currentGame.content.split('').map(char => {
        // 保留标点符号和换行符，隐藏汉字
        if (/[\u4e00-\u9fa5]/.test(char)) {
            // 根据难度决定是否显示一些字
            if (difficulty === 'easy' && Math.random() < 0.3) {
                return { char: char, hidden: false };
            } else {
                return { char: char, hidden: true };
            }
        } else {
            return { char: char, hidden: false };
        }
    });
    
    guessedLetters.clear();
    guessCount = 0;
    gameWon = false;
    currentScore = 0;
    titleGuessedNotified = false;
    
    // 重置计时器，但不立即启动
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    startTime = 0;
    elements.timer.textContent = '00:00';
    
    updateDisplay();
    elements.message.innerHTML = '';
    elements.winMessage.style.display = 'none';
    elements.letterInput.value = '';
    elements.letterInput.focus();
    
    // 更新分数显示
    updateScore();
    
    // 保存游戏状态到本地存储
    saveGameState();
}

// 更新显示
function updateDisplay() {
    elements.textDisplay.innerHTML = '';
    
    // 创建一个文档片段来提高性能
    const fragment = document.createDocumentFragment();
    let currentLine = document.createElement('div');
    currentLine.className = 'text-line';
    let lineCharCount = 0;
    const maxCharsPerLine = 20; // 每行最大字符数
    
    hiddenText.forEach(item => {
        // 处理换行符
        if (item.char === '\n') {
            fragment.appendChild(currentLine);
            currentLine = document.createElement('div');
            currentLine.className = 'text-line';
            lineCharCount = 0;
            return;
        }
        
        // 创建字符元素
        const span = document.createElement('span');
        if (item.hidden) {
            span.className = 'hidden-char';
            span.textContent = '　'; // 全角空格
        } else {
            // 区分用户猜出的字和系统显示的字
            if (item.hasOwnProperty('guessedByUser')) {
                span.className = item.guessedByUser ? 'guessed-by-user' : 'revealed-by-system';
            } else {
                span.className = 'visible-char';
            }
            span.textContent = item.char;
        }
        
        // 添加到当前行
        currentLine.appendChild(span);
        lineCharCount++;
        
        // 检查是否需要换行（标点符号除外）
        if (lineCharCount >= maxCharsPerLine && !/[，。！？、：；'"]/u.test(item.char)) {
            fragment.appendChild(currentLine);
            currentLine = document.createElement('div');
            currentLine.className = 'text-line';
            lineCharCount = 0;
        }
    });
    
    // 添加最后一行
    if (currentLine.childNodes.length > 0) {
        fragment.appendChild(currentLine);
    }
    
    elements.textDisplay.appendChild(fragment);
    
    // 更新已猜字母列表
    elements.guessedLetters.innerHTML = '';
    Array.from(guessedLetters).sort().forEach(letter => {
        const span = document.createElement('span');
        span.className = 'letter-item';
        span.textContent = letter;
        elements.guessedLetters.appendChild(span);
    });
    
    // 更新猜测次数
    elements.guessCount.textContent = guessCount;
}

// 更新计时器
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 更新分数
function updateScore() {
    // 根据难度、猜测次数和用时计算分数
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    
    // 计算基础分数
    const baseScore = 1000;
    const timeDeduction = Math.min(500, elapsedTime * 2);
    const guessDeduction = guessCount * 10;
    
    currentScore = Math.max(0, Math.floor((baseScore - timeDeduction - guessDeduction) * difficultyMultiplier));
    
    elements.score.textContent = currentScore;
}

// 猜测文字
function guessLetter() {
    if (gameWon) return;
    
    // 第一次猜测时启动计时器
    if (!timerInterval && startTime === 0) {
        startTime = Date.now();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    const letter = elements.letterInput.value.trim();
    
    if (!letter) {
        showMessage('请输入一个汉字！', 'error');
        return;
    }
    
    if (!/[\u4e00-\u9fa5]/.test(letter)) {
        showMessage('请输入汉字！', 'error');
        return;
    }
    
    if (guessedLetters.has(letter)) {
        showMessage('已经猜过这个字了！', 'error');
        elements.letterInput.value = '';
        return;
    }
    
    guessCount++;
    guessedLetters.add(letter);
    
    let found = false;
    hiddenText.forEach((item, index) => {
        if (item.hidden && item.char === letter) {
            item.hidden = false;
            found = true;
            
            // 添加高亮动画效果
            setTimeout(() => {
                const spans = elements.textDisplay.getElementsByTagName('span');
                if (spans[index]) {
                    spans[index].classList.add('highlight');
                    setTimeout(() => {
                        spans[index].classList.remove('highlight');
                    }, 1000);
                }
            }, 10);
        }
    });
    
    if (found) {
        showMessage(`找到了 ${letter}！`, 'success');
    } else {
        showMessage(`文章中没有 "${letter}"`, 'error');
    }
    
    elements.letterInput.value = '';
    updateDisplay();
    updateScore();
    
    // 检查标题是否已经完全猜出
    checkTitleGuessed();
    
    // 检查是否所有文字都已显示
    if (hiddenText.every(item => !item.hidden)) {
        showWinMessage();
    }
    
    // 保存游戏状态
    saveGameState();
    
    elements.letterInput.focus();
}



// 检查标题是否已经完全猜出
function checkTitleGuessed() {
    // 获取标题行的所有字符
    const titleChars = [];
    let foundNewline = false;
    
    for (let i = 0; i < hiddenText.length; i++) {
        if (hiddenText[i].char === '\n') {
            foundNewline = true;
            break;
        }
        titleChars.push(hiddenText[i]);
    }
    
    // 检查标题是否已经全部显示
    const titleFullyRevealed = titleChars.every(item => !item.hidden);
    
    // 如果标题已经全部显示，游戏结束
    if (titleFullyRevealed && !titleGuessedNotified) {
        // 标记已猜出的字
        const guessedChars = new Set();
        guessedLetters.forEach(letter => guessedChars.add(letter));
        
        // 显示所有文字，但标记用户猜出的字
        hiddenText.forEach(item => {
            if (item.hidden) {
                item.hidden = false;
                item.guessedByUser = false; // 未被用户猜出
            } else {
                item.guessedByUser = true; // 被用户猜出
            }
        });
        
        updateDisplay();
        showWinMessage();
        titleGuessedNotified = true;
    }
}

// 显示胜利信息
function showWinMessage() {
    gameWon = true;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    updateScore();
    
    elements.winMessage.innerHTML = `
        🎉 恭喜你猜对了！🎉<br>
        作者：${currentGame.author} (${currentGame.dynasty})<br>
        总共猜测了 ${guessCount} 次<br>
        用时：${elements.timer.textContent}<br>
        得分：${currentScore}
    `;
    elements.winMessage.style.display = 'block';
    showMessage('游戏结束！', 'success');
    
    // 保存最高分
    saveHighScore();
}

// 显示消息
function showMessage(text, type) {
    elements.message.textContent = text;
    elements.message.className = 'message ' + type;
    
    // 2秒后自动清除消息
    setTimeout(() => {
        if (elements.message.textContent === text) {
            elements.message.textContent = '';
            elements.message.className = 'message';
        }
    }, 2000);
}

// 切换难度
function changeDifficulty() {
    difficulty = elements.difficultySelector.value;
    resetGame();
}

// 切换主题
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // 保存主题设置到本地存储
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    
    // 更新主题图标
    elements.themeToggle.textContent = isDarkTheme ? '🌞' : '🌙';
}

// 保存游戏状态到本地存储
function saveGameState() {
    if (!currentGame) return;
    
    const gameState = {
        currentGameIndex: gameData.findIndex(game => game.title === currentGame.title),
        hiddenText: hiddenText,
        guessedLetters: Array.from(guessedLetters),
        guessCount: guessCount,
        startTime: startTime,
        difficulty: difficulty
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// 从本地存储加载游戏状态
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (!savedState) return false;
    
    try {
        const gameState = JSON.parse(savedState);
        
        if (gameState.currentGameIndex >= 0 && gameState.currentGameIndex < gameData.length) {
            currentGame = gameData[gameState.currentGameIndex];
            hiddenText = gameState.hiddenText;
            guessedLetters = new Set(gameState.guessedLetters);
            guessCount = gameState.guessCount;
            startTime = gameState.startTime || 0;
            difficulty = gameState.difficulty || 'medium';
            
            // 如果之前已经开始计时，则恢复计时器
            if (startTime > 0) {
                updateTimer();
                timerInterval = setInterval(updateTimer, 1000);
            }
            
            // 更新难度选择器
            if (elements.difficultySelector) {
                elements.difficultySelector.value = difficulty;
            }
            
            updateDisplay();
            updateTimer();
            updateScore();
            
            // 重新启动计时器
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            timerInterval = setInterval(updateTimer, 1000);
            
            return true;
        }
    } catch (e) {
        console.error('加载游戏状态失败:', e);
    }
    
    return false;
}

// 保存最高分
function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    
    highScores.push({
        title: currentGame.title,
        score: currentScore,
        guessCount: guessCount,
        time: elements.timer.textContent,
        date: new Date().toISOString()
    });
    
    // 按分数排序并只保留前10个
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores.length = 10;
    }
    
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

// 显示最高分
function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    
    if (highScores.length === 0) {
        alert('暂无最高分记录');
        return;
    }
    
    let message = '最高分排行榜:\n\n';
    highScores.forEach((score, index) => {
        const date = new Date(score.date).toLocaleDateString();
        message += `${index + 1}. 《${score.title}》 - ${score.score}分 (猜测${score.guessCount}次, 用时${score.time}) - ${date}\n`;
    });
    
    alert(message);
}

// 重置游戏
function resetGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    initGame();
}

// 初始化
function init() {
    // 加载主题设置
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        if (elements.themeToggle) {
            elements.themeToggle.textContent = '🌞';
        }
    }
    
    // 尝试加载保存的游戏状态
    if (!loadGameState()) {
        initGame();
    }
    
    // 添加事件监听器
    elements.letterInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            guessLetter();
        }
    });
    
    if (elements.difficultySelector) {
        elements.difficultySelector.addEventListener('change', changeDifficulty);
    }
    
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
}

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', init);

// 导出函数供HTML调用
window.guessLetter = guessLetter;
window.resetGame = resetGame;
window.showHighScores = showHighScores;
window.toggleTheme = toggleTheme;