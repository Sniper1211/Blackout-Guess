/**
 * 诗词数据导入配置
 * 请填入你的 Supabase 服务密钥
 */

module.exports = {
  supabase: {
    url: 'https://bejoqvymupzhtmxjxqvb.supabase.co',
    
    // 请从 Supabase 项目设置 -> API -> 服务密钥 获取并填入
    serviceKey: 'YOUR_SERVICE_ROLE_KEY_HERE',
  },
  
  data: {
    filePath: './new-shici.json',
    excludeCategories: ['高中文言文'],
    checkDuplicates: true,
  },
  
  importStrategy: {
    startDate: '2026-04-01',
    daysPerCategory: 30,
    skipExisting: true,
    batchSize: 50,
    batchDelay: 1000,
  },
  
  logging: {
    level: 'info',
    verbose: true,
    saveLog: true,
    logFile: './import_shici.log',
  },
};