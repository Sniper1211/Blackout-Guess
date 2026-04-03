/**
 * 诗词数据导入配置
 * 
 * 配置说明:
 * 1. 复制此文件为 config.js 并修改配置
 * 2. 或者设置环境变量
 */

module.exports = {
  // Supabase 配置
  supabase: {
    // 从 Supabase 项目设置中获取
    url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    
    // 使用 service_role 密钥（有完全访问权限）
    // 从 Supabase 项目设置 -> API -> 服务密钥 获取
    serviceKey: process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key',
    
    // 或者使用 anon 密钥（需要配置 RLS 策略）
    anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  },
  
  // 数据文件配置
  data: {
    // 诗词数据文件路径
    filePath: './new-shici.json',
    
    // 排除的分类（与 JSON 文件中的 exclude 字段对应）
    excludeCategories: ['高中文言文'],
    
    // 是否包含重复诗词检查
    checkDuplicates: true,
    
    // 重复检查字段
    duplicateFields: ['title', 'author'],
  },
  
  // 导入策略配置
  importStrategy: {
    // 起始发布日期
    startDate: '2026-04-01',
    
    // 每个分类分配的天数
    daysPerCategory: 30,
    
    // 是否跳过已存在的诗词
    skipExisting: true,
    
    // 导入批次大小
    batchSize: 50,
    
    // 批次间延迟（毫秒，避免速率限制）
    batchDelay: 1000,
    
    // 日期分配策略: 'sequential'（顺序）或 'random'（随机）
    dateAllocation: 'sequential',
    
    // 随机日期范围（当 dateAllocation 为 'random' 时生效）
    randomDateRange: {
      start: '2026-04-01',
      end: '2027-03-31',
    },
  },
  
  // 日志配置
  logging: {
    // 日志级别: 'debug', 'info', 'warn', 'error'
    level: 'info',
    
    // 是否输出详细进度
    verbose: true,
    
    // 是否保存导入日志到文件
    saveLog: true,
    
    // 日志文件路径
    logFile: './import_shici.log',
  },
  
  // 数据转换配置
  transformation: {
    // 默认类型
    defaultType: 'poem',
    
    // 默认语言
    defaultLanguage: 'zh-CN',
    
    // 默认状态
    defaultStatus: 'published',
    
    // 是否启用
    defaultEnabled: true,
    
    // 内容转换：将诗句数组转换为字符串
    contentConverter: (contentArray) => {
      return contentArray.join('\n');
    },
    
    // 作者处理：如果作者为空，使用默认值
    authorProcessor: (author) => {
      return author || '佚名';
    },
    
    // 朝代处理：如果朝代为空，使用默认值
    dynastyProcessor: (dynasty) => {
      return dynasty || '未知';
    },
  },
  
  // 分类映射配置（可选）
  categoryMapping: {
    // 将 JSON 中的分类映射到数据库中的标签或分类
    // 例如：'初中古诗·七年级上册(课外)' -> '初中诗词'
    mappings: {
      '初中古诗.*': '初中诗词',
      '高中古诗.*': '高中诗词',
      '小学古诗.*': '小学诗词',
    },
    
    // 默认分类
    defaultCategory: '经典诗词',
  },
  
  // 验证配置
  validation: {
    // 是否验证数据格式
    validateData: true,
    
    // 必填字段
    requiredFields: ['title', 'content'],
    
    // 字段长度限制
    fieldLimits: {
      title: 200,
      author: 100,
      dynasty: 50,
    },
    
    // 内容长度限制
    contentMaxLength: 5000,
  },
  
  // 错误处理配置
  errorHandling: {
    // 遇到错误时是否继续
    continueOnError: true,
    
    // 最大错误数量
    maxErrors: 100,
    
    // 错误重试次数
    retryAttempts: 3,
    
    // 重试延迟（毫秒）
    retryDelay: 2000,
    
    // 错误日志文件
    errorLogFile: './import_errors.log',
  },
  
  // 性能配置
  performance: {
    // 并发请求数量
    concurrency: 1,
    
    // 请求超时时间（毫秒）
    timeout: 30000,
    
    // 内存使用限制（MB）
    memoryLimit: 512,
  },
};

/**
 * 使用说明:
 * 
 * 1. 基本使用:
 *    - 复制此文件为 config.js
 *    - 修改 supabase.url 和 supabase.serviceKey
 *    - 运行: node import_shici.js import
 * 
 * 2. 环境变量方式:
 *    - 设置环境变量:
 *      export SUPABASE_URL="https://your-project.supabase.co"
 *      export SUPABASE_SERVICE_KEY="your-service-key"
 *    - 运行: node import_shici.js import
 * 
 * 3. 生成 SQL 文件:
 *    - 运行: node import_shici.js sql
 *    - 然后手动执行生成的 SQL 文件
 * 
 * 4. 自定义配置:
 *    - 创建 config.js 文件
 *    - 修改需要的配置项
 *    - 在 import_shici.js 中加载配置
 */