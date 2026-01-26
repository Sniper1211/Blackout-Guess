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
        this.user = null;
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

            // 初始化 Supabase 客户端（可选）需在加载题库前完成
            try {
                if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                    this.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                    console.log('Supabase 已初始化');
                    // 配置认证与登录按钮
                    this.setupAuth();
                } else {
                    console.log('未检测到 Supabase 配置，跳过初始化');
                }
            } catch (e) {
                console.warn('Supabase 初始化失败:', e);
            }

            // 在初始化UI前尝试加载在线题库（若可用）
            const loaded = await this.loadQuestionBank().catch(() => false);
            // 初始化UI
            this.uiManager.init();

            // 初始化设备ID
            try {
                const existingId = localStorage.getItem('deviceId');
                this.deviceId = existingId || (crypto && crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}`);
                localStorage.setItem('deviceId', this.deviceId);
            } catch {}

            // （已提前）Supabase 初始化

            // 隐藏加载指示器
            this.hideLoadingIndicator();

            this.isInitialized = true;
            console.log('应用程序初始化完成');

            // 更新数据来源徽标
            try {
                const badge = document.getElementById('dataSourceBadge');
                if (badge) {
                    const hasData = Array.isArray(this.gameEngine?.gameData) && this.gameEngine.gameData.length > 0;
                    const sourceText = loaded ? '在线题库' : (hasData ? '内置题库' : '暂无数据');
                    const sourceAttr = loaded ? 'remote' : (hasData ? 'local' : 'empty');
                    badge.textContent = `题库：${sourceText}`;
                    badge.setAttribute('data-source', sourceAttr);
                }
            } catch {}

        } catch (error) {
            console.error('应用程序初始化失败:', error);
            this.showError('应用程序初始化失败，请刷新页面重试');
        }
    }

    /**
     * 设置认证与登录登出按钮
     */
    setupAuth() {
        if (!this.supabase) return;

        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');
        const userBadge = document.getElementById('userBadge');

        const getDisplayName = (user) => {
            try {
                return (
                    user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email ||
                    user?.phone ||
                    user?.id ||
                    '用户'
                );
            } catch { return '用户'; }
        };

        const updateUI = (user) => {
            if (userBadge) {
                userBadge.textContent = user ? `已登录：${getDisplayName(user)}` : '未登录';
            }
            if (btnLogin) btnLogin.style.display = user ? 'none' : 'inline-block';
            if (btnLogout) btnLogout.style.display = user ? 'inline-block' : 'none';
        };

        // 处理 OAuth 回跳的哈希参数，确保解析会话并清理长哈希（避免误触发404页面）
        try {
            const hash = window.location.hash || '';
            const hasAuthParams = /access_token|refresh_token|error|code/i.test(hash);
            if (hasAuthParams) {
                // 解析会话（supabase-js 会消费哈希并建立 session）
                this.supabase.auth.getSession()
                    .then(({ data, error }) => {
                        if (!error) {
                            this.user = data?.session?.user || null;
                            updateUI(this.user);
                        }
                    })
                    .finally(() => {
                        // 清理 URL 中的哈希，避免后续刷新再次出现长哈希
                        try {
                            const url = new URL(window.location.href);
                            url.hash = '';
                            window.history.replaceState(null, document.title, url.toString());
                        } catch {}
                    });
            }
        } catch {}

        // 初始用户状态
        this.supabase.auth.getUser()
            .then(({ data, error }) => {
                if (!error) {
                    this.user = data?.user || null;
                    updateUI(this.user);
                }
            })
            .catch(() => {});

        // 监听状态变化
        this.supabase.auth.onAuthStateChange((_event, session) => {
            this.user = session?.user || null;
            updateUI(this.user);
        });

        // 登录/登出事件
        if (btnLogin) {
            btnLogin.addEventListener('click', async () => {
                try {
                    // 不显式传递 redirectTo，使用 Supabase 项目中配置的 Site URL
                    // 避免线上路径与 index.html 变体不一致导致回调失败
                    await this.supabase.auth.signInWithOAuth({
                        provider: 'google'
                    });
                } catch (e) {
                    console.warn('发起登录失败:', e);
                    this.showError('登录失败，请稍后重试');
                }
            });
        }

        if (btnLogout) {
            btnLogout.addEventListener('click', async () => {
                try {
                    await this.supabase.auth.signOut();
                    this.user = null;
                    updateUI(null);
                } catch (e) {
                    console.warn('退出登录失败:', e);
                }
            });
        }
    }

    /**
     * 加载题库（从 Supabase），并映射到 GameEngine 的数据结构
     * 保持对离线/无表场景的回退：若加载失败或为空，则使用内置题库
     */
    async loadQuestionBank(type = 'poem') {
        try {
            if (!this.supabase) return false;

            // 读取全局设置：是否启用“每日一题”模式
            const dailyMode = await this.getDailyModeEnabled();

            // 当每日模式开启：优先读取“今日已发布”的内容（每日一个）
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;

            const selectFields = 'id,type,title,content,author,dynasty,enabled,language,status,publish_date,published_at';

            let rows = [];
            if (dailyMode) {
                let { data, error } = await this.supabase
                    .from('question_bank')
                    .select(selectFields)
                    .eq('status', 'published')
                    .eq('publish_date', todayStr)
                    .eq('language', 'zh-CN')
                    .eq('enabled', true)
                    .limit(10);
                if (error) {
                    console.warn('加载今日发布失败：', error.message);
                }
                rows = Array.isArray(data) ? data : [];
            } else {
                // 自由模式：直接读取启用的中文题目，忽略发布状态
                const { data: freeData, error: freeErr } = await this.supabase
                    .from('question_bank')
                    .select('id,type,title,content,author,dynasty,enabled,language')
                    .eq('enabled', true)
                    .eq('language', 'zh-CN')
                    .limit(100);
                if (freeErr) {
                    console.warn('加载自由模式题库失败：', freeErr.message);
                }
                rows = Array.isArray(freeData) ? freeData : [];
            }
            // 回退逻辑（仅在每日模式时适用）：今天没有内容→取最近发布
            if (dailyMode && rows.length === 0) {
                const { data: latest, error: err2 } = await this.supabase
                    .from('question_bank')
                    .select(selectFields)
                    .eq('status', 'published')
                    .eq('language', 'zh-CN')
                    .eq('enabled', true)
                    .order('publish_date', { ascending: false, nullsLast: true })
                    .order('published_at', { ascending: false, nullsLast: true })
                    .limit(1);
                if (err2) {
                    console.warn('加载最近发布失败：', err2.message);
                }
                rows = Array.isArray(latest) ? latest : [];
            }
            // 自由模式下：若取到多条，前端随机取 1 条即可

            // 仅使用与当前游戏类型匹配的题目（默认 poem）
            const items = rows
                .filter(r => (r.type || 'poem') === type)
                .map(r => {
                    const hasNewline = typeof r.content === 'string' && r.content.includes('\n');
                    const content = hasNewline ? r.content : `${r.title}\n${r.content || ''}`;
                    return {
                        title: r.title || '未命名作品',
                        content,
                        author: r.author || '',
                        dynasty: r.dynasty || ''
                    };
                });

            if (items.length > 0) {
                if (dailyMode) {
                    this.gameEngine.gameData = items.slice(0, 1);
                    console.log(`题库已加载：${this.gameEngine.gameData.length} 条（每日模式）`);
                } else {
                    const pick = items[Math.floor(Math.random() * items.length)];
                    this.gameEngine.gameData = [pick];
                    console.log(`题库已加载：1 条（自由模式，随机选择）`);
                }
                return true;
            } else {
                console.log('在线题库为空，暂无题库数据');
                return false;
            }
        } catch (e) {
            console.warn('加载题库异常：', e);
            return false;
        }
    }

    async getDailyModeEnabled() {
        try {
            if (!this.supabase) return false;
            const { data, error } = await this.supabase
                .from('app_settings')
                .select('daily_mode_enabled')
                .eq('id', 'global')
                .limit(1);
            if (error) {
                console.warn('读取每日模式设置失败：', error.message);
                return false;
            }
            const row = Array.isArray(data) && data[0] ? data[0] : null;
            return !!(row && row.daily_mode_enabled);
        } catch (e) {
            console.warn('读取每日模式设置异常：', e);
            return false;
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
                // 优先使用认证用户信息
                user_id: this.user?.id || null,
                username: (this.user ? (
                    this.user.user_metadata?.full_name || this.user.user_metadata?.name || this.user.email || null
                ) : (localStorage.getItem('username') || null)),
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
     * (已移除阻止滚动的逻辑，以修复页面无法下拉的问题)
     */
    preventScrollAndTouch() {
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

        // 防止键盘弹出时的页面滚动（仅微调）
        window.addEventListener('resize', () => {
            // 保持当前视口位置，而不是强制回顶
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