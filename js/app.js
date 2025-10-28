/**
 * 主应用程序
 * 作用是初始化和协调各个模块
 */
class App {
    constructor() {
        this.gameEngine = null;
        this.uiManager = null;
        this.audioManager = null;
        this.isInitialized = false;
        this.supabase = null;
        this.deviceId = null;
    }

    /**
     * 初始化应用程序
     */
    async init() {
        try {
            // 显示加载指示器
            this.showLoadingIndicator();

            // 初始化各个模块
            this.gameEngine = new GameEngine();
            this.audioManager = new AudioManager();
            this.uiManager = new UIManager(this.gameEngine);

            // 绑定全局事件
            this.bindGlobalEvents();

            // 初始化UI
            this.uiManager.init();

            // 初始化设备ID
            try {
                const existingId = localStorage.getItem('deviceId');
                this.deviceId = existingId || (crypto && crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}`);
                localStorage.setItem('deviceId', this.deviceId);
            } catch {}

            // 初始化 Supabase 客户端（可选）
            try {
                if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                    this.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                    console.log('Supabase 已初始化');
                } else {
                    console.log('未检测到 Supabase 配置，跳过初始化');
                }
            } catch (e) {
                console.warn('Supabase 初始化失败:', e);
            }

            // 隐藏加载指示器
            this.hideLoadingIndicator();

            this.isInitialized = true;
            console.log('应用程序初始化完成');

        } catch (error) {
            console.error('应用程序初始化失败:', error);
            this.showError('应用程序初始化失败，请刷新页面重试');
        }
    }

    async reportSession() {
        try {
            if (!this.supabase || !this.gameEngine || !this.gameEngine.currentGame) return;
            const ge = this.gameEngine;
            const g = ge.currentGame;
            const accuracy = ge.guessCount > 0 ? Math.round((ge.correctGuesses / ge.guessCount) * 100) : 100;
            const payload = {
                device_id: this.deviceId,
                poem_title: g.title,
                author: g.author,
                dynasty: g.dynasty,
                score: ge.currentScore,
                duration_seconds: ge.getElapsedTime(),
                guess_count: ge.guessCount,
                correct_guesses: ge.correctGuesses,
                wrong_guesses: ge.wrongGuesses,
                hint_count: ge.hintCount,
                max_combo: ge.maxConsecutiveHits,
                accuracy,
                created_at: new Date().toISOString()
            };
            const { error } = await this.supabase.from('game_sessions').insert(payload);
            if (error) {
                console.warn('上报成绩失败:', error.message);
                if (this.uiManager) {
                    this.uiManager.showMessage(`在线成绩上报失败：${error.message}`, 'error');
                }
            } else {
                console.log('成绩已上报');
                if (this.uiManager) {
                    this.uiManager.showMessage('在线成绩已上报', 'success');
                }
            }
        } catch (e) {
            console.warn('上报成绩异常:', e);
            if (this.uiManager) {
                this.uiManager.showMessage('在线成绩上报异常，请稍后重试', 'error');
            }
        }
    }

    async fetchLeaderboard(limit = 10) {
        try {
            if (!this.supabase) return null;
            const { data, error } = await this.supabase
                .from('game_sessions')
                .select('*')
                .order('score', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                console.warn('获取排行榜失败:', error.message);
                return null;
            }
            return data || null;
        } catch (e) {
            console.warn('获取排行榜异常:', e);
            return null;
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 防止页面滚动和误触
        this.preventScrollAndTouch();
        
        // 页面可见性变化事件
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.uiManager.stopTimer();
            } else if (this.gameEngine.startTime > 0 && !this.gameEngine.gameWon) {
                this.uiManager.startTimer();
            }
        });

        // 窗口失焦/获焦事件
        window.addEventListener('blur', () => {
            this.uiManager.stopTimer();
        });

        window.addEventListener('focus', () => {
            if (this.gameEngine.startTime > 0 && !this.gameEngine.gameWon) {
                this.uiManager.startTimer();
            }
        });

        // 用户交互事件（用于恢复音频上下文）
        document.addEventListener('click', () => {
            this.audioManager.resumeAudioContext();
        }, { once: true });

        // 错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.showError('发生了一个错误，请刷新页面重试');
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            event.preventDefault();
        });
    }

    /**
     * 防止页面滚动和误触
     */
    preventScrollAndTouch() {
        // 防止页面滚动
        document.addEventListener('touchmove', (e) => {
            // 只允许在文本显示区域内滚动（如果内容超出）
            const textDisplay = document.getElementById('textDisplay');
            if (!textDisplay || !textDisplay.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });

        // 防止双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // 防止双击缩放的另一种方法
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // 防止页面被拖拽
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        // 防止右键菜单（移动端长按）
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 防止选择文本（除了输入框）
        document.addEventListener('selectstart', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        // 防止键盘弹出时的页面滚动
        window.addEventListener('resize', () => {
            // 延迟执行，确保键盘动画完成
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });

        // 确保页面始终在顶部
        window.addEventListener('scroll', () => {
            window.scrollTo(0, 0);
        }, { passive: false });
    }

    /**
     * 显示加载指示器
     */
    showLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载指示器
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ 错误</h3>
                <p>${message}</p>
                <button onclick="location.reload()">刷新页面</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * 猜测字符（供HTML调用）
     */
    guessLetter() {
        if (!this.isInitialized) return;
        
        const result = this.uiManager.handleGuess();
        
        // 播放音效
        if (result && this.audioManager) {
            if (result.success) {
                this.audioManager.playSuccess();
            } else {
                this.audioManager.playError();
            }
            
            if (result.gameComplete) {
                setTimeout(() => {
                    this.audioManager.playWin();
                }, 500);
            }
        }
    }

    /**
     * 重置游戏（供HTML调用）
     */
    resetGame() {
        if (!this.isInitialized) return;
        
        this.uiManager.resetGame();
        this.audioManager.playClick();
    }

    /**
     * 显示排行榜（供HTML调用）
     */
    showHighScores() {
        if (!this.isInitialized) return;
        try {
            window.open('leaderboard.html', '_blank');
        } catch {}
        this.audioManager.playClick();
    }

    /**
     * 切换主题（供HTML调用）
     */
    toggleTheme() {
        if (!this.isInitialized) return;
        
        this.uiManager.toggleTheme();
        this.audioManager.playClick();
    }

    /**
     * 使用提示（供HTML调用）
     */
    useHint() {
        if (!this.isInitialized) return;
        
        this.uiManager.useHint();
        this.audioManager.playHint();
    }

    /**
     * 切换音效（供HTML调用）
     */
    toggleSound() {
        if (!this.isInitialized) return;
        
        const enabled = this.audioManager.toggleSound();
        const button = document.getElementById('soundToggle');
        if (button) {
            button.textContent = enabled ? '🔊' : '🔇';
            button.title = enabled ? '关闭音效' : '开启音效';
        }
        
        if (enabled) {
            this.audioManager.playClick();
        }
    }

    /**
     * 设置音量（供HTML调用）
     */
    setVolume(volume) {
        if (!this.isInitialized) return;
        
        this.audioManager.setVolume(volume);
    }
}

// 创建全局应用实例
const app = new App();
// 暴露到全局，便于 UIManager 等模块调用在线功能
window.app = app;

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 导出函数供HTML调用
window.guessLetter = () => app.guessLetter();
window.resetGame = () => app.resetGame();
window.showHighScores = () => app.showHighScores();
window.toggleTheme = () => app.toggleTheme();
window.useHint = () => app.useHint();
window.toggleSound = () => app.toggleSound();
window.setVolume = (volume) => app.setVolume(volume);