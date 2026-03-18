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
    }

    /**
     * 初始化UI元素引用
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

            hintButton: document.getElementById('hintButton'),
            guessButton: document.getElementById('guessButton'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            usernameInput: document.getElementById('usernameInput'),

            calendarButton: document.getElementById('calendarButton'),
            historyModal: document.getElementById('historyModal'),
            closeHistoryBtn: document.getElementById('closeHistoryBtn'),
            historyList: document.getElementById('historyList'),
            calendarGrid: document.getElementById('calendarGrid'),
            yearSelect: document.getElementById('yearSelect'),
            monthSelect: document.getElementById('monthSelect'),
            toastContainer: document.getElementById('toastContainer'),
            completionCount: document.getElementById('completionCount')
        };
        
        // 用于日历的状态
        this.currentCalendarDate = new Date();
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
                    if (window.app && typeof window.app.guessLetter === 'function') {
                        window.app.guessLetter();
                    } else {
                        this.handleGuess();
                    }
                }
            });

            // 输入法开始
            this.elements.letterInput.addEventListener('compositionstart', () => {
                isComposing = true;
            });
            
            // 输入法结束
            this.elements.letterInput.addEventListener('compositionend', (e) => {
                isComposing = false;
                // this.processInput(e.target);
            });
            
            // 输入事件处理
            this.elements.letterInput.addEventListener('input', (e) => {
                if (!isComposing) {
                    // this.processInput(e.target);
                }
            });

            // 粘贴事件处理
            this.elements.letterInput.addEventListener('paste', (e) => {
                // e.preventDefault();
                // const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                // const chineseChar = this.extractChineseChar(pastedText);
                // if (chineseChar) {
                //     e.target.value = chineseChar;
                // }
            });
        }


        // 猜字按钮
        if (this.elements.guessButton) {
            this.elements.guessButton.addEventListener('click', () => {
                if (window.app && typeof window.app.guessLetter === 'function') {
                    window.app.guessLetter();
                } else {
                    this.handleGuess();
                }
            });
        }

        // 提示按钮
        if (this.elements.hintButton) {
            this.elements.hintButton.addEventListener('click', () => {
                this.useHint();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 提示快捷键: Ctrl/Cmd + H
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                // 必须限制次数：未获胜且未使用过提示
                if (!this.gameEngine.gameWon && !this.gameEngine.hintUsed) {
                    console.log('触发快捷键提示');
                    this.useHint();
                } else if (this.gameEngine.hintUsed) {
                    this.showMessage('提示次数已用完', 'error');
                }
            }
        });

        // 用户名输入保存到本地
        if (this.elements.usernameInput) {
            try {
                const saved = localStorage.getItem('username') || '';
                if (saved) this.elements.usernameInput.value = saved;
            } catch {}

            const saveName = (val) => {
                const name = (val || '').trim().slice(0, 20);
                try {
                    localStorage.setItem('username', name);
                    if (name) {
                        this.showMessage('用户名已保存', 'success');
                    }
                } catch {}
            };
            this.elements.usernameInput.addEventListener('change', (e) => saveName(e.target.value));
            this.elements.usernameInput.addEventListener('blur', (e) => saveName(e.target.value));
        }

        // 历史题目弹窗
        if (this.elements.calendarButton) {
            this.elements.calendarButton.addEventListener('click', () => {
                this.openHistoryModal();
            });
        }

        if (this.elements.closeHistoryBtn) {
            this.elements.closeHistoryBtn.addEventListener('click', () => {
                this.closeHistoryModal();
            });
        }

        // 点击遮罩关闭弹窗
        if (this.elements.historyModal) {
            this.elements.historyModal.addEventListener('click', (e) => {
                if (e.target === this.elements.historyModal) {
                    this.closeHistoryModal();
                }
            });
        }

        // 日历翻页/选择
        if (this.elements.yearSelect) {
            this.elements.yearSelect.addEventListener('change', (e) => {
                this.currentCalendarDate.setFullYear(parseInt(e.target.value));
                this.renderHistoryCalendar();
            });
        }

        if (this.elements.monthSelect) {
            this.elements.monthSelect.addEventListener('change', (e) => {
                this.currentCalendarDate.setMonth(parseInt(e.target.value));
                this.renderHistoryCalendar();
            });
        }
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
     * @param {Array} newlyGuessedIndices - 新猜出的字符索引数组
     */
    updateDisplay(newlyGuessedIndices = []) {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            this.updateTextDisplay(newlyGuessedIndices);
            this.updateGuessedLetters();
            this.updateStats();
            this.updateHintButton();
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * 更新文本显示区域
     * @param {Array} newlyGuessedIndices - 新猜出的字符索引数组
     */
    updateTextDisplay(newlyGuessedIndices = []) {
        if (!this.elements.textDisplay || !this.gameEngine.hiddenText) return;

        // 使用DocumentFragment提高性能
        const fragment = document.createDocumentFragment();
        let currentLine = document.createElement('div');
        // 第一行默认为标题行，添加 title-line 类
        let isFirstLine = true;
        currentLine.className = 'text-line title-line';
        
        this.gameEngine.hiddenText.forEach((item, index) => {
            if (item.char === '\n') {
                fragment.appendChild(currentLine);
                currentLine = document.createElement('div');
                currentLine.className = 'text-line'; // 后续行使用普通样式
                isFirstLine = false;
                return;
            }

            const span = document.createElement('span');
            span.dataset.index = index;
            
            // 判断是否为标点符号（非汉字、非字母、非数字）
            const isPunctuation = /[^\u4e00-\u9fa5a-zA-Z0-9]/.test(item.char);

            if (item.hidden) {
                span.className = 'hidden-char';
                span.innerHTML = '&nbsp;'; // 使用HTML空格确保占位
                span.setAttribute('aria-label', '隐藏字符');
            } else {
                if (isPunctuation) {
                    span.className = 'punctuation-char';
                } else if (item.revealType) {
                    // 根据 revealType 分配类名
                    if (item.revealType === 'user') {
                        span.className = 'guessed-by-user';
                    } else if (item.revealType === 'hint') {
                        span.className = 'revealed-by-hint';
                    } else if (item.revealType === 'auto') {
                        span.className = 'revealed-auto';
                    } else {
                        span.className = 'visible-char';
                    }

                    // 如果是新猜出的字，添加动画类
                    if (newlyGuessedIndices.includes(index) && item.revealType === 'user') {
                        span.classList.add('newly-guessed');
                    }
                } else if (item.hasOwnProperty('guessedByUser')) {
                    // 兼容旧存档逻辑
                    span.className = item.guessedByUser ? 'guessed-by-user' : 'revealed-auto';
                    
                    if (newlyGuessedIndices.includes(index) && item.guessedByUser) {
                        span.classList.add('newly-guessed');
                    }
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
    }

    /**
     * 更新完成人数
     */
    updateCompletionCount(count) {
        if (this.elements.completionCount) {
            this.elements.completionCount.textContent = count !== undefined ? count : '-';
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
        
        // 校验输入长度
        if (letter.length !== 1) {
            this.showMessage('请输入一个汉字', 'error');
            // 重新聚焦
            this.elements.letterInput.focus();
            return;
        }

        const result = this.gameEngine.guessLetter(letter);
        
        // 显示基本消息
        this.showMessage(result.message, result.type);
        
        // (已移除) 显示积分奖励信息
        
        // if (result.success && result.foundPositions) {
        //    this.highlightFoundCharacters(result.foundPositions);
        // }
        
        this.elements.letterInput.value = '';
        this.updateDisplay(result.success ? result.foundPositions : []);
        
        console.log('UIManager handleGuess result before returning:', result);

        try {
            if (result.titleComplete || result.gameComplete) {
                console.log('UIManager triggering showWinMessage');
                this.showWinMessage(result.scoreBreakdown);
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
            
            console.log('UIManager returning result:', result);
            return result;
        } catch (error) {
            console.error('Error in UIManager.handleGuess post-processing:', error);
            // 即使抛错，也返回 result，保证外层逻辑继续
            return result;
        }
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
     * 显示消息（支持全局 Toast）
     */
    showMessage(text, type = 'info', duration = 3000) {
        // 1. 更新边栏消息（保留，作为辅助）
        if (this.elements.message) {
            this.elements.message.textContent = text;
            this.elements.message.className = `message ${type}`;
            this.elements.message.style.opacity = '1';
            
            setTimeout(() => {
                if (this.elements.message.textContent === text) {
                    this.elements.message.style.opacity = '0';
                }
            }, duration);
        }

        // 2. 显示全局 Toast（解决遮挡问题）
        if (this.elements.toastContainer) {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            // 根据类型添加图标
            let icon = 'ℹ️';
            if (type === 'success') icon = '✅';
            if (type === 'error') icon = '⚠️';
            
            toast.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
            this.elements.toastContainer.appendChild(toast);

            // 自动移除
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, duration);
        }
    }

    /**
     * 显示胜利消息
     */
    showWinMessage(scoreBreakdown) {
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
        // (已移除) 积分计算与等级
        
        this.elements.winMessage.innerHTML = `
            <div class="win-content">
                <button class="win-close-btn" aria-label="关闭" title="关闭">✖</button>
                <div class="win-emoji">🎉</div>
                <div class="win-title">恭喜你猜对了！</div>
                <div class="win-details">
                    <div class="win-item">
                        <span class="win-label">作品：</span>
                        <span class="win-value">《${game.title}》</span>
                    </div>
                    ${game.author || game.dynasty ? `
                    <div class="win-item">
                        <span class="win-label">${game.author ? '作者：' : '来源：'}</span>
                        <span class="win-value">${game.author ? `${game.author}${game.dynasty ? ` (${game.dynasty})` : ''}` : game.dynasty}</span>
                    </div>
                    ` : ''}
                    <div class="win-item">
                        <span class="win-label">用时：</span>
                        <span class="win-value">${this.gameEngine.getFormattedTime()}</span>
                    </div>
                    ${this.gameEngine.maxConsecutiveHits >= 2 ? `
                    <div class="win-item">
                        <span class="win-label">最高连击：</span>
                        <span class="win-value">🔥 ${this.gameEngine.maxConsecutiveHits}连击</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        this.elements.winMessage.classList.add('show');
        this.elements.winMessage.setAttribute('aria-live', 'assertive');

        const closeBtn = this.elements.winMessage.querySelector('.win-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeWinMessage();
            });
        }

        // 添加庆祝动画
        this.addCelebrationAnimation();
    }

    closeWinMessage() {
        if (this.elements.winMessage) {
            this.elements.winMessage.classList.remove('show');
        }
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
     * 打开历史题目弹窗
     */
    async openHistoryModal() {
        if (!this.elements.historyModal) return;
        
        this.elements.historyModal.classList.add('show');
        this.currentCalendarDate = new Date(); // 每次打开重置到当前月
        this.initCalendarSelectors();
        this.renderHistoryCalendar();
        
        // 根据系统偏好或网站主题自动应用深色主题
        this.applyHistoryModalTheme();
    }

    /**
     * 初始化日历选择框
     */
    initCalendarSelectors() {
        if (!this.elements.yearSelect || !this.elements.monthSelect) return;

        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;
        const endYear = currentYear + 1;

        // 初始化年份
        this.elements.yearSelect.innerHTML = '';
        for (let y = startYear; y <= endYear; y++) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = `${y}年`;
            if (y === this.currentCalendarDate.getFullYear()) option.selected = true;
            this.elements.yearSelect.appendChild(option);
        }

        // 初始化月份
        this.elements.monthSelect.innerHTML = '';
        for (let m = 0; m < 12; m++) {
            const option = document.createElement('option');
            option.value = m;
            option.textContent = `${m + 1}月`;
            if (m === this.currentCalendarDate.getMonth()) option.selected = true;
            this.elements.monthSelect.appendChild(option);
        }
    }

    /**
     * 关闭历史题目弹窗
     */
    closeHistoryModal() {
        if (this.elements.historyModal) {
            this.elements.historyModal.classList.remove('show');
        }
    }

    /**
     * 应用历史弹窗主题（已废弃，保持统一浅色主题）
     */
    applyHistoryModalTheme() {
        // 移除暗色主题切换逻辑，保持单一配色
        const modalContent = document.querySelector('.history-modal-content');
        if (modalContent) {
            modalContent.classList.remove('dark-theme');
        }
    }

    /**
     * 渲染历史题目日历
     */
    async renderHistoryCalendar() {
        if (!this.elements.calendarGrid) {
            console.warn('[DEBUG] 日历网格元素不存在');
            return;
        }

        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        console.log(`[DEBUG] 开始渲染日历，年份: ${year}, 月份: ${month + 1}`);

        // 同步选择框
        if (this.elements.yearSelect) this.elements.yearSelect.value = year;
        if (this.elements.monthSelect) this.elements.monthSelect.value = month;

        // 显示加载状态（如果数据未缓存，用户会看到短暂loading，否则瞬间渲染）
        // 这里不强制清空innerHTML，以避免闪烁，仅在无数据时显示loading
        if (!window.app) {
            console.warn('[DEBUG] window.app 不存在');
            return;
        }
        
        // 计算需要的月份数据（当前月，可能还有上月和下月）
        // 简单起见，我们加载当前月、上个月和下个月，确保网格首尾的日期都有数据
        const promises = [
            window.app.fetchMonthQuestions(year, month),
            window.app.fetchMonthQuestions(year, month - 1), // 上个月 (JS会自动处理年份变化)
            window.app.fetchMonthQuestions(year, month + 1)  // 下个月
        ];

        // 只有当第一次加载（缓存为空）时才显示loading
        const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        if (window.app.loadedMonths && !window.app.loadedMonths.has(currentMonthKey)) {
             this.elements.calendarGrid.innerHTML = '<div class="loading-spinner" style="grid-column: span 7; margin: 20px auto;"></div>';
        }

        console.log(`[DEBUG] 开始获取月份题目数据，当前月: ${currentMonthKey}`);
        await Promise.allSettled(promises);
        
        const questionMap = window.app.questionsMap || {};
        // 生产环境中不显示题目映射表详情

        // 获取当前正在进行的游戏题目ID和标题，用于高亮显示
        const currentGameData = this.gameEngine.gameData && this.gameEngine.gameData[0];
        const currentQuestionId = currentGameData ? currentGameData.id : null;
        const currentQuestionTitle = currentGameData ? currentGameData.title : null;

        this.elements.calendarGrid.innerHTML = '';

        // 添加星期表头 (一 二 三 四 五 六 日)
        const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
        dayLabels.forEach(label => {
            const el = document.createElement('div');
            el.className = 'calendar-day-label';
            el.textContent = label;
            this.elements.calendarGrid.appendChild(el);
        });

        // 计算日历开始日期 (本月第一天所在的周一)
        const firstDayOfMonth = new Date(year, month, 1);
        let startDayOffset = firstDayOfMonth.getDay(); // 0 是周日
        startDayOffset = (startDayOffset === 0 ? 7 : startDayOffset) - 1; // 转换为周一为 0

        const startDate = new Date(year, month, 1 - startDayOffset);
        
        // 使用DateUtils处理日期，解决时区问题
        const todayStr = window.DateUtils ? window.DateUtils.getTodayString() : 
            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

        // 始终渲染 42 个格子 (6 行)
        for (let i = 0; i < 42; i++) {
            const currentLoopDate = new Date(startDate);
            currentLoopDate.setDate(startDate.getDate() + i);

            const dYear = currentLoopDate.getFullYear();
            const dMonth = currentLoopDate.getMonth();
            const dDay = currentLoopDate.getDate();
            const dateStr = `${dYear}-${String(dMonth + 1).padStart(2, '0')}-${String(dDay).padStart(2, '0')}`;
            
            const isCurrentMonth = dMonth === month && dYear === year;
            
            // 使用DateUtils进行日期比较
            let isToday = dateStr === todayStr;
            let isFuture = dateStr > todayStr;
            
            if (window.DateUtils) {
                isToday = window.DateUtils.isToday(dateStr);
                isFuture = window.DateUtils.isFutureDate(dateStr);
            }
            const question = questionMap[dateStr];
            
            // 调试日志：显示重要日期的题目信息（不泄露题目内容）
            if (question && (isToday || dateStr.includes('2026-01'))) {
                console.log(`[DEBUG] 日期 ${dateStr} 找到题目`);
            }
            
            const el = document.createElement('div');
            el.className = 'calendar-date';
            if (isCurrentMonth) el.classList.add('current-month');
            else el.classList.add('other-month');
            
            if (isToday) el.classList.add('today');
            if (isFuture) el.classList.add('future-date');
            if (question) {
                    el.classList.add('has-question');
                    // 检查是否为当前选中的题目（优先匹配ID，如果ID不存在则尝试匹配标题）
                    const isIdMatch = currentQuestionId && String(question.id) === String(currentQuestionId);
                    // 增强标题匹配：忽略首尾空格
                    const currentTitle = currentQuestionTitle ? String(currentQuestionTitle).trim() : '';
                    const questionTitle = question.title ? String(question.title).trim() : '';
                    const isTitleMatch = !currentQuestionId && currentTitle && currentTitle === questionTitle;
                    
                    if (isIdMatch || isTitleMatch) {
                        el.classList.add('selected');
                        console.log(`[UI] 日历选中: ${dateStr}, 题目: ${questionTitle}, 匹配方式: ${isIdMatch ? 'ID' : 'Title'}`);
                    }
                }

            el.innerHTML = `<span class="date-num">${dDay}</span>`;

            if (question && !isFuture) { // 即使 DB 有数据，未来日期也不可点击
                console.log(`[DEBUG] 为日期 ${dateStr} 添加可点击题目`);
                const marker = document.createElement('div');
                marker.className = 'question-marker';
                el.appendChild(marker);
                
                el.title = `${dateStr} (有题目)`;
                // 优先绑定有题目的点击事件
                el.addEventListener('click', async (e) => {
                    e.stopPropagation(); // 防止冒泡
                    console.log(`点击日期: ${dateStr}`);
                    const success = await window.app.loadSpecificQuestion(question.id);
                    if (success) this.closeHistoryModal();
                });
            } else {
                // 没有题目或未来日期的格子
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (isFuture) {
                        this.showMessage('别着急，日子还没到', 'info');
                        return;
                    }

                    if (!isCurrentMonth) {
                        // 非本月点击切换月份
                        this.currentCalendarDate = new Date(dYear, dMonth, 1);
                        this.initCalendarSelectors();
                        this.renderHistoryCalendar();
                    } else {
                        // 本月无题目，显示提示
                        this.showMessage('该日期暂无题目', 'info');
                    }
                });
            }

            this.elements.calendarGrid.appendChild(el);
        }
    }

    /**
     * 渲染历史题目列表
     */
    async renderHistoryList() {
        if (!this.elements.historyList) return;
        
        this.elements.historyList.innerHTML = '<div class="loading-spinner" style="margin: 20px auto;"></div>';
        
        if (!window.app) {
            this.elements.historyList.innerHTML = '<div class="message error">应用未初始化</div>';
            return;
        }
        
        const questions = await window.app.fetchPastQuestions();
        
        if (!questions || questions.length === 0) {
            this.elements.historyList.innerHTML = '<div class="message">暂无过往题目</div>';
            return;
        }
        
        this.elements.historyList.innerHTML = '';
        
        questions.forEach(q => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-info">
                    <div class="history-title">${q.title}</div>
                    ${q.author || q.dynasty ? `<div class="history-meta">${q.author ? q.author : ''}${q.author && q.dynasty ? ' · ' : ''}${q.dynasty ? q.dynasty : ''}</div>` : ''}
                </div>
                <div class="history-date">${q.publish_date || ''}</div>
            `;
            
            item.addEventListener('click', async () => {
                const success = await window.app.loadSpecificQuestion(q.id);
                if (success) {
                    this.closeHistoryModal();
                }
            });
            
            this.elements.historyList.appendChild(item);
        });
    }

    /**
     * 更新日历高亮状态
     */

    /**
     * 重置游戏
     */
    resetGame() {
        this.stopTimer();
        this.gameEngine.initGame();
        
        if (this.elements.winMessage) {
            this.elements.winMessage.classList.remove('show');
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
    async showHighScores() {
        this.showMessage('排行榜暂不可用', 'info');
        return;
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
        const ok = this.gameEngine.initGame();
        this.updateDisplay();

        // 无题库数据时禁用交互并提示
        if (ok === false || !this.gameEngine.currentGame || !this.gameEngine.hiddenText || this.gameEngine.hiddenText.length === 0) {
            if (this.elements.letterInput) {
                this.elements.letterInput.disabled = true;
            }
            if (this.elements.guessButton) {
                this.elements.guessButton.disabled = true;
            }
            if (this.elements.hintButton) {
                this.elements.hintButton.disabled = true;
            }
            this.showMessage('题库为空，请检查在线题库或刷新重试', 'error');
        }
        
        // 设置帮助浮窗
        this.setupHelpModal();
        
        // 聚焦输入框
        if (this.elements.letterInput) {
            this.elements.letterInput.focus();
        }
    }

    /**
     * 显示奖励消息
     */
    showBonusMessage(bonusPoints, consecutiveHits) {
        if (!this.elements.message) return;

        let bonusText = '';
        if (consecutiveHits >= 2) {
            bonusText = `🔥 ${consecutiveHits}连击！+${bonusPoints}分`;
        } else if (bonusPoints > 0) {
            bonusText = `✨ 奖励 +${bonusPoints}分`;
        }

        if (bonusText) {
            this.elements.message.textContent = bonusText;
            this.elements.message.className = 'message bonus';
            this.elements.message.style.display = 'block';

            // 添加特殊动画效果
            this.elements.message.style.animation = 'none';
            setTimeout(() => {
                this.elements.message.style.animation = 'bounce 0.6s ease-in-out';
            }, 10);

            // 自动隐藏
            setTimeout(() => {
                if (this.elements.message && this.elements.message.textContent === bonusText) {
                    this.elements.message.style.opacity = '0';
                    setTimeout(() => {
                        this.elements.message.textContent = '';
                        this.elements.message.className = 'message';
                        this.elements.message.style.animation = '';
                        this.elements.message.style.opacity = '1';
                    }, 300);
                }
            }, 2000);
        }
    }
}

// 导出类
window.UIManager = UIManager;
