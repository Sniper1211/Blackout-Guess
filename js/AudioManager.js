/**
 * 音频管理器
 * 负责游戏音效和背景音乐
 * 影响用户体验，可注释掉
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        
        this.initAudioContext();
        this.loadSettings();
    }

    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('音频上下文初始化失败:', error);
        }
    }

    /**
     * 创建音效
     */
    createSound(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext || !this.enabled) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('音效播放失败:', error);
        }
    }

    /**
     * 播放成功音效
     */
    playSuccess() {
        // 播放上升的和弦
        this.createSound(523.25, 0.2, 'sine', 0.3); // C5
        setTimeout(() => this.createSound(659.25, 0.2, 'sine', 0.3), 100); // E5
        setTimeout(() => this.createSound(783.99, 0.3, 'sine', 0.3), 200); // G5
    }

    /**
     * 播放错误音效
     */
    playError() {
        // 播放下降音调
        this.createSound(400, 0.15, 'sawtooth', 0.2);
        setTimeout(() => this.createSound(300, 0.15, 'sawtooth', 0.2), 150);
    }

    /**
     * 播放胜利音效
     */
    playWin() {
        // 播放胜利旋律
        const melody = [
            { freq: 523.25, time: 0 },    // C5
            { freq: 659.25, time: 200 },  // E5
            { freq: 783.99, time: 400 },  // G5
            { freq: 1046.5, time: 600 },  // C6
            { freq: 783.99, time: 800 },  // G5
            { freq: 1046.5, time: 1000 }, // C6
        ];

        melody.forEach(note => {
            setTimeout(() => {
                this.createSound(note.freq, 0.3, 'sine', 0.4);
            }, note.time);
        });
    }

    /**
     * 播放提示音效
     */
    playHint() {
        // 播放神秘的提示音
        this.createSound(800, 0.1, 'triangle', 0.2);
        setTimeout(() => this.createSound(1000, 0.1, 'triangle', 0.2), 100);
        setTimeout(() => this.createSound(1200, 0.2, 'triangle', 0.2), 200);
    }

    /**
     * 播放按钮点击音效
     */
    playClick() {
        this.createSound(800, 0.05, 'square', 0.1);
    }

    /**
     * 播放输入音效
     */
    playInput() {
        this.createSound(600, 0.05, 'sine', 0.1);
    }

    /**
     * 设置音量
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    /**
     * 切换音效开关
     */
    toggleSound() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            localStorage.setItem('audioSettings', JSON.stringify({
                enabled: this.enabled,
                volume: this.volume
            }));
        } catch (error) {
            console.warn('保存音频设置失败:', error);
        }
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('audioSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.enabled = parsed.enabled !== false;
                this.volume = parsed.volume || 0.5;
            }
        } catch (error) {
            console.warn('加载音频设置失败:', error);
        }
    }

    /**
     * 恢复音频上下文（用户交互后）
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// 导出类
window.AudioManager = AudioManager;