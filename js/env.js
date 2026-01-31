/**
 * 环境检测与配置工具
 * 用于区分开发环境与生产环境，控制调试日志和行为
 */

const EnvUtils = {
    /**
     * 检测当前是否为生产环境
     * @returns {boolean} 是否为生产环境
     */
    isProduction() {
        // 方法1：通过URL检测
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isLocalIP = /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
        
        // 方法2：通过端口检测（本地开发通常使用8001）
        const port = window.location.port;
        const isDevPort = port === '8001' || port === '3000' || port === '8080';
        
        // 方法3：通过Supabase配置检测（生产环境使用生产Supabase）
        const supabaseUrl = window.SUPABASE_URL || '';
        const isProdSupabase = supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost');
        
        // 综合判断：如果不是本地环境且不是开发端口，则认为是生产环境
        return !isLocalhost && !isLocalIP && !isDevPort && isProdSupabase;
    },
    
    /**
     * 检测当前是否为开发环境
     * @returns {boolean} 是否为开发环境
     */
    isDevelopment() {
        return !this.isProduction();
    },
    
    /**
     * 安全日志函数 - 只在开发环境显示详细日志
     * @param {string} level - 日志级别：log, warn, error, info, debug
     * @param {string} message - 日志消息
     * @param {...any} args - 附加参数
     */
    safeLog(level, message, ...args) {
        if (this.isDevelopment()) {
            // 开发环境：显示完整日志
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const prefix = `[${timestamp}]`;
            
            switch(level) {
                case 'warn':
                    console.warn(prefix, message, ...args);
                    break;
                case 'error':
                    console.error(prefix, message, ...args);
                    break;
                case 'info':
                    console.info(prefix, message, ...args);
                    break;
                case 'debug':
                    console.debug(prefix, message, ...args);
                    break;
                default:
                    console.log(prefix, message, ...args);
            }
        } else {
            // 生产环境：只显示错误和警告，且不包含敏感信息
            const safeMessage = this.sanitizeMessage(message);
            
            if (level === 'error' || level === 'warn') {
                const safeArgs = args.map(arg => this.sanitizeData(arg));
                if (level === 'error') {
                    console.error(safeMessage, ...safeArgs);
                } else {
                    console.warn(safeMessage, ...safeArgs);
                }
            }
            // 生产环境中忽略log/info/debug级别的日志
        }
    },
    
    /**
     * 清理消息中的敏感信息
     * @param {string} message - 原始消息
     * @returns {string} 清理后的消息
     */
    sanitizeMessage(message) {
        if (typeof message !== 'string') return message;
        
        // 移除可能包含题目信息的模式
        const patterns = [
            /题目.*[:：].*/g,
            /title.*[:：].*/gi,
            /author.*[:：].*/gi,
            /content.*[:：].*/gi,
            /诗词.*[:：].*/g,
            /诗句.*[:：].*/g,
            /poem.*[:：].*/gi,
            /ID.*[:：]\s*\d+/gi,
            /《.*》/g
        ];
        
        let sanitized = message;
        patterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '[已清理]');
        });
        
        return sanitized;
    },
    
    /**
     * 清理数据中的敏感信息
     * @param {any} data - 原始数据
     * @returns {any} 清理后的数据
     */
    sanitizeData(data) {
        if (typeof data === 'string') {
            return this.sanitizeMessage(data);
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        
        if (data && typeof data === 'object') {
            const sanitized = {};
            for (const key in data) {
                if (key.includes('title') || key.includes('author') || key.includes('content') || 
                    key.includes('诗词') || key.includes('诗句') || key === 'id') {
                    sanitized[key] = '[已清理]';
                } else {
                    sanitized[key] = this.sanitizeData(data[key]);
                }
            }
            return sanitized;
        }
        
        return data;
    },
    
    /**
     * 初始化环境配置
     */
    init() {
        // 将安全日志函数暴露给全局
        window.safeLog = this.safeLog.bind(this);
        window.isProduction = this.isProduction.bind(this);
        window.isDevelopment = this.isDevelopment.bind(this);
        
        // 生产环境中禁用某些调试功能
        if (this.isProduction()) {
            // 禁用console.table（可能暴露数据结构）
            console.table = () => {};
            
            // 简化console.dir的输出
            const originalDir = console.dir;
            console.dir = function(obj, options) {
                if (obj && typeof obj === 'object') {
                    const safeObj = EnvUtils.sanitizeData(obj);
                    originalDir.call(console, safeObj, options);
                } else {
                    originalDir.call(console, obj, options);
                }
            };
        }
        
        this.safeLog('info', '环境检测完成', {
            isProduction: this.isProduction(),
            isDevelopment: this.isDevelopment(),
            hostname: window.location.hostname,
            port: window.location.port
        });
    }
};

// 自动初始化
if (typeof window !== 'undefined') {
    EnvUtils.init();
}

// Node.js环境导出支持（用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvUtils;
}
