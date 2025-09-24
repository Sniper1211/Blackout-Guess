/**
 * UI管理器
 * 负责界面更新、用户交互和视觉效果
 */
class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = {};
        this.timerInterval = null;
        this.isUpdating = false;
        
        this.initElements();
        this.bindEvents();
        this.loadTheme();
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        this.elements = {
            textDisplay: document.getElementById('textDisplay'),
            letterInput: document.getElementById('letterInput'),
            message: document.getElementById('message'),
            guessCount: document.getElementById('guessCount'),
            guessedLetters: document.getElementById('guessedLetters'),
            winMessage: document.getElementById('winMessage'),
            timer: document.getElementById('timer'),
            score: document.getElementById('score'),

            themeToggle: document.getElementById('themeToggle'),
            hintButton: document.getElementById('hintButton'),
            guessButton: document.getElementById('guessButton'),
            loadingIndicator: document.getElementById('loadingIndicator')
        };
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 输入框事件
        if (this.elements.letterInput) {
            let isComposing = false;
            
            // 键盘事件处理
            this.elements.letterInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !isComposing) {
                    this.handleGuess();
                }
            });

            // 输入法开始
            this.elements.letterInput.addEventListener('compositionstart', () => {
                isComposing = true;
            });
            
            // 输入法结束
            this.elements.letterInput.addEventListener('compositionend', (e) => {
                isComposing = false;
                this.processInput(e.target);
            });
            
            // 输入事件处理
            this.elements.letterInput.addEventListener('input', (e) => {
                if (!isComposing) {
                    this.processInput(e.target);
                }
            });

            // 粘贴事件处理
            this.elements.letterInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const chineseChar = this.extractChineseChar(pastedText);
                if (chineseChar) {
                    e.target.value = chineseChar;
                }
            });
        }


        // 主题切换
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 提示按钮
        if (this.elements.hintButton) {
            this.elements.hintButton.addEventListener('click', () => {
                this.useHint();
            });
        }

        // 音量控制
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                if (window.app && window.app.audioManager) {
                    window.app.audioManager.setVolume(parseFloat(e.target.value));
                }
            });
        }

        // 音效切换
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                if (window.toggleSound) {
                    window.toggleSound();
                }
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.resetGame();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.useHint();
                        break;
                }
            }
        });
    }

    /**
     * 处理输入内容，确保只保留一个汉字
     */
    processInput(inputElement) {
        const value = inputElement.value;
        if (value.length > 1) {
            const chineseChar = this.extractChineseChar(value);
            inputElement.value = chineseChar || value.slice(-1);
        }
    }

    /**
     * 提取字符串中的最后一个汉字
     */
    extractChineseChar(text) {
        const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
        return chineseChars ? chineseChars[chineseChars.length - 1] : null;
    }

    /**
     * 更新游戏显示
     */
    updateDisplay() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            this.updateTextDisplay();
            this.updateGuessedLetters();
            this.updateStats();
            this.updateHintButton();
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * 更新文本显示区域
     */
    updateTextDisplay() {
        if (!this.elements.textDisplay || !this.gameEngine.hiddenText) return;

        // 使用DocumentFragment提高性能
        const fragment = document.createDocumentFragment();
        let currentLine = document.createElement('div');
        currentLine.className = 'text-line';
        
        this.gameEngine.hiddenText.forEach((item, index) => {
            if (item.char === '\n') {
                fragment.appendChild(currentLine);
                currentLine = document.createElement('div');
                currentLine.className = 'text-line';
                return;
            }

            const span = document.createElement('span');
            span.dataset.index = index;
            
            if (item.hidden) {
                span.className = 'hidden-char';
                span.innerHTML = '&nbsp;'; // 使用HTML空格确保占位
                span.setAttribute('aria-label', '隐藏字符');
            } else {
                if (item.hasOwnProperty('guessedByUser')) {
                    span.className = item.guessedByUser ? 'guessed-by-user' : 'revealed-by-system';
                } else {
                    span.className = 'visible-char';
                }
                span.textContent = item.char;
                span.setAttribute('aria-label', `字符: ${item.char}`);
            }

            currentLine.appendChild(span);
        });

        if (currentLine.childNodes.length > 0) {
            fragment.appendChild(currentLine);
        }

        this.elements.textDisplay.innerHTML = '';
        this.elements.textDisplay.appendChild(fragment);
    }

    /**
     * 更新已猜字母列表
     */
    updateGuessedLetters() {
        if (!this.elements.guessedLetters) return;

        this.elements.guessedLetters.innerHTML = '';
        
        if (this.gameEngine.guessedLetters.size === 0) {
            this.elements.guessedLetters.innerHTML = '<span class="no-guesses">还没有猜过字符</span>';
            return;
        }

        Array.from(this.gameEngine.guessedLetters).forEach(letter => {
            const span = document.createElement('span');
            span.className = 'letter-item';
            span.textContent = letter;
            span.setAttribute('aria-label', `已猜字符: ${letter}`);
            this.elements.guessedLetters.appendChild(span);
        });
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (this.elements.guessCount) {
            this.elements.guessCount.textContent = this.gameEngine.guessCount;
        }
        
        if (this.elements.timer) {
            this.elements.timer.textContent = this.gameEngine.getFormattedTime();
        }
        
        if (this.elements.score) {
            this.elements.score.textContent = this.gameEngine.calculateScore();
        }
    }

    /**
     * 更新提示按钮状态
     */
    updateHintButton() {
        if (!this.elements.hintButton) return;

        const hintsRemaining = this.gameEngine.hintUsed ? 0 : 1;
        
        this.elements.hintButton.textContent = `提示 (${hintsRemaining})`;
        this.elements.hintButton.disabled = this.gameEngine.hintUsed || this.gameEngine.gameWon;
    }

    /**
     * 开始计时器
     */
    startTimer() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            this.updateStats();
        }, 1000);
    }

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 处理猜测
     */
    handleGuess() {
        // 如果游戏已经结束，不处理猜测
        if (this.gameEngine.gameWon) {
            return;
        }
        
        const letter = this.elements.letterInput.value.trim();
        const result = this.gameEngine.guessLetter(letter);
        
        this.showMessage(result.message, result.type);
        
        if (result.success && result.foundPositions) {
            this.highlightFoundCharacters(result.foundPositions);
        }
        
        this.elements.letterInput.value = '';
        this.updateDisplay();
        
        if (result.titleComplete || result.gameComplete) {
            this.showWinMessage();
        }
        
        // 只有在游戏未结束且已开始计时的情况下才启动计时器
        if (this.gameEngine.startTime > 0 && !this.gameEngine.gameWon) {
            this.startTimer();
        }
        
        // 保存游戏状态
        this.saveGameState();
        
        // 重新聚焦输入框
        setTimeout(() => {
            this.elements.letterInput.focus();
        }, 100);
        
        return result;
    }

    /**
     * 高亮找到的字符
     */
    highlightFoundCharacters(positions) {
        positions.forEach(position => {
            const span = this.elements.textDisplay.querySelector(`[data-index="${position}"]`);
            if (span) {
                span.classList.add('highlight');
                setTimeout(() => {
                    span.classList.remove('highlight');
                }, 1000);
            }
        });
    }

    /**
     * 显示消息
     */
    showMessage(text, type = 'info', duration = 3000) {
        if (!this.elements.message) return;

        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
        this.elements.message.setAttribute('aria-live', 'polite');
        
        // 添加淡入动画
        this.elements.message.style.opacity = '0';
        this.elements.message.style.transform = 'translateY(-10px)';
        
        requestAnimationFrame(() => {
            this.elements.message.style.transition = 'all 0.3s ease';
            this.elements.message.style.opacity = '1';
            this.elements.message.style.transform = 'translateY(0)';
        });

        // 自动清除消息
        setTimeout(() => {
            if (this.elements.message.textContent === text) {
                this.elements.message.style.opacity = '0';
                setTimeout(() => {
                    this.elements.message.textContent = '';
                    this.elements.message.className = 'message';
                }, 300);
            }
        }, duration);
    }

    /**
     * 显示胜利消息
     */
    showWinMessage() {
        if (!this.elements.winMessage || !this.gameEngine.currentGame) return;

        this.stopTimer();
        
        // 禁用输入框和按钮
        if (this.elements.letterInput) {
            this.elements.letterInput.disabled = true;
        }
        if (this.elements.guessButton) {
            this.elements.guessButton.disabled = true;
        }
        
        const game = this.gameEngine.currentGame;
        const score = this.gameEngine.calculateScore();
        
        this.elements.winMessage.innerHTML = `
            <div class="win-content">
                <div class="win-emoji">🎉</div>
                <div class="win-title">恭喜你猜对了！</div>
                <div class="win-details">
                    <div class="win-item">
                        <span class="win-label">作品：</span>
                        <span class="win-value">《${game.title}》</span>
                    </div>
                    <div class="win-item">
                        <span class="win-label">作者：</span>
                        <span class="win-value">${game.author} (${game.dynasty})</span>
                    </div>
                    <div class="win-item">
                        <span class="win-label">猜测次数：</span>
                        <span class="win-value">${this.gameEngine.guessCount} 次</span>
                    </div>
                    <div class="win-item">
                        <span class="win-label">用时：</span>
                        <span class="win-value">${this.gameEngine.getFormattedTime()}</span>
                    </div>
                    <div class="win-item">
                        <span class="win-label">得分：</span>
                        <span class="win-value win-score">${score}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.winMessage.style.display = 'block';
        this.elements.winMessage.setAttribute('aria-live', 'assertive');
        
        // 保存最高分
        this.saveHighScore();
        
        // 添加庆祝动画
        this.addCelebrationAnimation();
    }

    /**
     * 添加庆祝动画
     */
    addCelebrationAnimation() {
        // 创建彩带效果
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 100);
        }
    }

    /**
     * 创建彩带粒子
     */
    createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }

    /**
     * 使用提示
     */
    useHint() {
        const result = this.gameEngine.useHint();
        this.showMessage(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            this.updateDisplay();
            this.saveGameState();
        }
    }


    /**
     * 切换主题
     */
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDarkTheme);
        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.textContent = isDarkTheme ? '🌞' : '🌙';
        }
        
        // 添加主题切换动画
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }

    /**
     * 加载主题设置
     */
    loadTheme() {
        const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            if (this.elements.themeToggle) {
                this.elements.themeToggle.textContent = '🌞';
            }
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.stopTimer();
        this.gameEngine.initGame();
        
        if (this.elements.winMessage) {
            this.elements.winMessage.style.display = 'none';
        }
        
        if (this.elements.letterInput) {
            this.elements.letterInput.value = '';
            this.elements.letterInput.disabled = false;
            this.elements.letterInput.focus();
        }
        
        if (this.elements.guessButton) {
            this.elements.guessButton.disabled = false;
        }
        
        this.updateDisplay();
        this.showMessage('游戏已重置', 'info');
        this.saveGameState();
    }

    /**
     * 保存游戏状态
     */
    saveGameState() {
        try {
            const gameState = this.gameEngine.getGameState();
            localStorage.setItem('gameState', JSON.stringify(gameState));
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }

    /**
     * 加载游戏状态
     */
    loadGameState() {
        try {
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                if (this.gameEngine.loadGameState(gameState)) {
                    if (this.gameEngine.startTime > 0) {
                        this.startTimer();
                    }
                    
                    this.updateDisplay();
                    return true;
                }
            }
        } catch (error) {
            console.error('加载游戏状态失败:', error);
        }
        return false;
    }

    /**
     * 保存最高分
     */
    saveHighScore() {
        try {
            const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
            
            highScores.push({
                title: this.gameEngine.currentGame.title,
                score: this.gameEngine.currentScore,
                guessCount: this.gameEngine.guessCount,
                time: this.gameEngine.getFormattedTime(),
                date: new Date().toISOString()
            });
            
            // 按分数排序并只保留前10个
            highScores.sort((a, b) => b.score - a.score);
            if (highScores.length > 10) {
                highScores.length = 10;
            }
            
            localStorage.setItem('highScores', JSON.stringify(highScores));
        } catch (error) {
            console.error('保存最高分失败:', error);
        }
    }

    /**
     * 显示最高分
     */
    showHighScores() {
        try {
            const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
            
            if (highScores.length === 0) {
                this.showMessage('暂无最高分记录', 'info');
                return;
            }
            
            let message = '🏆 最高分排行榜 🏆\n\n';
            highScores.forEach((score, index) => {
                const date = new Date(score.date).toLocaleDateString();
                const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
                message += `${medal} 《${score.title}》\n`;
                message += `   分数: ${score.score}\n`;
                message += `   猜测: ${score.guessCount}次 | 用时: ${score.time}\n`;
                message += `   日期: ${date}\n\n`;
            });
            
            alert(message);
        } catch (error) {
            console.error('显示最高分失败:', error);
            this.showMessage('读取排行榜失败', 'error');
        }
    }

    /**
     * 设置帮助浮窗
     */
    setupHelpModal() {
        // 添加全局函数到 window 对象
        window.showGameHelp = () => {
            const helpModal = document.getElementById('helpModal');
            if (helpModal) {
                helpModal.classList.add('show');
                helpModal.setAttribute('aria-hidden', 'false');
                
                // 聚焦到关闭按钮以便键盘导航
                const closeBtn = helpModal.querySelector('.help-close-btn');
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
            }
        };

        window.closeGameHelp = () => {
            const helpModal = document.getElementById('helpModal');
            if (helpModal) {
                helpModal.classList.remove('show');
                helpModal.setAttribute('aria-hidden', 'true');
                
                // 返回焦点到帮助按钮
                const helpButton = document.querySelector('.help-button');
                if (helpButton) {
                    helpButton.focus();
                }
            }
        };

        // ESC 键关闭浮窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const helpModal = document.getElementById('helpModal');
                if (helpModal && helpModal.classList.contains('show')) {
                    window.closeGameHelp();
                }
            }
        });
    }

    /**
     * 初始化游戏
     */
    init() {
        // 清除可能存在的旧游戏状态（包含难度设置的状态）
        localStorage.removeItem('gameState');
        
        // 总是开始新游戏
        this.gameEngine.initGame();
        this.updateDisplay();
        
        // 设置帮助浮窗
        this.setupHelpModal();
        
        // 聚焦输入框
        if (this.elements.letterInput) {
            this.elements.letterInput.focus();
        }
    }
}

// 导出类
window.UIManager = UIManager;