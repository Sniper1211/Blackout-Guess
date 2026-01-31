/**
 * 日期工具函数
 * 解决时区问题，确保日期比较和格式化的一致性
 */

class DateUtils {
    /**
     * 将任意日期值规范化为用于存储/比较的 YYYY-MM-DD 字符串
     * 可处理：Date对象、YYYY-MM-DD字符串、ISO字符串(含时间)
     * @param {Date|string} dateVal
     * @returns {string} YYYY-MM-DD
     */
    static formatDateForStorage(dateVal) {
        if (!dateVal) return '';
        // Date 对象
        if (dateVal instanceof Date) {
            return this.formatLocalDate(dateVal);
        }
        // 字符串
        if (typeof dateVal === 'string') {
            // 如果是 ISO 字符串，取前10位
            if (dateVal.length >= 10 && dateVal.includes('T')) {
                return dateVal.slice(0, 10);
            }
            // 如果是 YYYY-MM-DD 格式，直接返回规范化
            const m = dateVal.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
            if (m) {
                const y = m[1];
                const mm = String(parseInt(m[2], 10)).padStart(2, '0');
                const dd = String(parseInt(m[3], 10)).padStart(2, '0');
                return `${y}-${mm}-${dd}`;
            }
            // 其他情况尝试用 Date 解析
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) {
                return this.formatLocalDate(d);
            }
            console.warn('[DateUtils] 无法规范化日期:', dateVal);
            return '';
        }
        // 其他类型不支持
        console.warn('[DateUtils] 非预期的日期类型:', typeof dateVal);
        return '';
    }
    /**
     * 获取本地时区的YYYY-MM-DD格式日期字符串
     * @param {Date} date - 日期对象
     * @returns {string} YYYY-MM-DD格式的日期字符串
     */
    static formatLocalDate(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.warn('[DateUtils] 无效的日期对象:', date);
            return '';
        }
        
        // 使用本地时区的年、月、日
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    /**
     * 将数据库日期字符串转换为本地时区的Date对象
     * @param {string} dateStr - 数据库日期字符串 (YYYY-MM-DD)
     * @returns {Date} 本地时区的Date对象
     */
    static parseDatabaseDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') {
            console.warn('[DateUtils] 无效的日期字符串:', dateStr);
            return new Date(NaN);
        }
        
        // 数据库日期通常是UTC或本地日期，我们按本地时区解析
        const parts = dateStr.split('-');
        if (parts.length !== 3) {
            console.warn('[DateUtils] 日期格式错误:', dateStr);
            return new Date(NaN);
        }
        
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS月份是0-based
        const day = parseInt(parts[2], 10);
        
        // 创建本地时区的日期
        const date = new Date(year, month, day);
        
        // 验证日期有效性
        if (isNaN(date.getTime())) {
            console.warn('[DateUtils] 解析后的日期无效:', dateStr);
            return new Date(NaN);
        }
        
        return date;
    }
    
    /**
     * 比较两个日期字符串（YYYY-MM-DD格式）
     * @param {string} dateStr1 - 第一个日期字符串
     * @param {string} dateStr2 - 第二个日期字符串
     * @returns {number} 比较结果：-1(date1<date2), 0(相等), 1(date1>date2)
     */
    static compareDateStrings(dateStr1, dateStr2) {
        if (!dateStr1 || !dateStr2) {
            console.warn('[DateUtils] 比较日期时参数为空:', dateStr1, dateStr2);
            return 0;
        }
        
        // 直接比较字符串，因为YYYY-MM-DD格式的字符串可以直接比较
        if (dateStr1 < dateStr2) return -1;
        if (dateStr1 > dateStr2) return 1;
        return 0;
    }
    
    /**
     * 检查日期是否是未来日期（相对于今天）
     * @param {string} dateStr - 要检查的日期字符串 (YYYY-MM-DD)
     * @returns {boolean} 是否是未来日期
     */
    static isFutureDate(dateStr) {
        const today = new Date();
        const todayStr = this.formatLocalDate(today);
        return this.compareDateStrings(dateStr, todayStr) > 0;
    }
    
    /**
     * 检查日期是否是今天
     * @param {string} dateStr - 要检查的日期字符串 (YYYY-MM-DD)
     * @returns {boolean} 是否是今天
     */
    static isToday(dateStr) {
        const today = new Date();
        const todayStr = this.formatLocalDate(today);
        return dateStr === todayStr;
    }
    
    /**
     * 获取今天的日期字符串 (YYYY-MM-DD)
     * @returns {string} 今天的日期字符串
     */
    static getTodayString() {
        return this.formatLocalDate(new Date());
    }
    
    /**
     * 获取指定年月的第一天和最后一天
     * @param {number} year - 年份
     * @param {number} month - 月份 (0-11)
     * @returns {Object} 包含firstDay和lastDay的对象
     */
    static getMonthRange(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0); // 下个月的第0天是本月最后一天
        
        return {
            firstDay: this.formatLocalDate(firstDay),
            lastDay: this.formatLocalDate(lastDay)
        };
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.DateUtils = DateUtils;
}

console.log('[DateUtils] 日期工具库已加载');
