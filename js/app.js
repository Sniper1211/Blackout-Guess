/**
 * 主应用程序
 * 负责初始化和协调各个模块
 */
class App {
    constructor() {
        this.gameEngine = null;
        this.uiManager = null;
        this.audioManager = null;
        this.isInitialized = false;
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

            // 隐藏加载指示器
            this.hideLoadingIndicator();

            this.isInitialized = true;
            console.log('应用程序初始化完成');

        } catch (error) {
            console.error('应用程序初始化失败:', error);
            this.showError('应用程序初始化失败，请刷新页面重试');
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
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
        
        this.uiManager.showHighScores();
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