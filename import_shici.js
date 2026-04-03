#!/usr/bin/env node

/**
 * 诗词数据导入脚本
 * 将 new-shici.json 中的数据导入到 Supabase 数据库
 * 
 * 使用方法:
 * 1. 配置 Supabase 环境变量或配置文件
 * 2. 运行: node import_shici.js import
 * 3. 或生成 SQL 文件: node import_shici.js sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 加载配置
let CONFIG = {
  // Supabase 配置（从环境变量或配置文件读取）
  supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  supabaseKey: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
  
  // 数据文件路径
  dataFile: path.join(__dirname, 'new-shici.json'),
  
  // 导入配置
  batchSize: 50, // 每批导入数量
  startDate: '2026-04-01', // 起始日期
  daysPerCategory: 30, // 每个分类分配的天数
  skipExisting: true, // 跳过已存在的题目
};

// 尝试加载配置文件
try {
  const configFile = path.join(__dirname, 'config.js');
  if (fs.existsSync(configFile)) {
    const userConfig = require(configFile);
    if (userConfig.supabase && userConfig.supabase.url) {
      CONFIG.supabaseUrl = userConfig.supabase.url;
    }
    if (userConfig.supabase && userConfig.supabase.serviceKey) {
      CONFIG.supabaseKey = userConfig.supabase.serviceKey;
    }
    console.log('已加载配置文件');
  }
} catch (error) {
  console.log('使用默认配置');
}

// 初始化 Supabase 客户端
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

/**
 * 读取诗词数据
 */
async function loadShiciData() {
  try {
    console.log(`正在读取数据文件: ${CONFIG.dataFile}`);
    const data = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
    
    console.log(`数据来源: ${data.source}`);
    console.log(`排除分类: ${data.exclude.join(', ')}`);
    console.log(`总分类数: ${data.categories.length}`);
    
    // 统计诗词总数
    let totalPoems = 0;
    data.categories.forEach(category => {
      totalPoems += category.poems.length;
    });
    console.log(`总诗词数: ${totalPoems}`);
    
    return data;
  } catch (error) {
    console.error('读取数据文件失败:', error.message);
    process.exit(1);
  }
}

/**
 * 检查诗词是否已存在
 */
async function checkPoemExists(title, author) {
  try {
    const { data, error } = await supabase
      .from('question_bank')
      .select('id')
      .eq('title', title)
      .eq('author', author)
      .limit(1);
    
    if (error) {
      console.warn(`检查诗词存在性失败: ${error.message}`);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.warn(`检查诗词存在性异常: ${error.message}`);
    return false;
  }
}

/**
 * 转换诗词数据为数据库格式
 */
function transformPoem(poem, publishDate) {
  // 将诗句数组转换为字符串（用换行符连接）
  const content = poem.content.join('\n');
  
  return {
    type: 'poem',
    title: poem.title,
    content: content,
    author: poem.author || '',
    dynasty: poem.dynasty || '',
    enabled: true,
    language: 'zh-CN',
    status: 'published',
    publish_date: publishDate,
    published_at: new Date().toISOString(),
  };
}

/**
 * 批量导入诗词数据
 */
async function importShiciData() {
  console.log('开始导入诗词数据...');
  
  // 1. 加载数据
  const shiciData = await loadShiciData();
  
  // 2. 准备导入数据
  const allPoems = [];
  let currentDate = new Date(CONFIG.startDate);
  
  // 按分类处理诗词
  for (const category of shiciData.categories) {
    console.log(`\n处理分类: ${category.category} (${category.poems.length}首)`);
    
    // 为当前分类分配日期范围
    const categoryStartDate = new Date(currentDate);
    const poemsPerDay = Math.ceil(category.poems.length / CONFIG.daysPerCategory);
    
    let dayOffset = 0;
    let poemIndex = 0;
    
    for (const poem of category.poems) {
      // 计算发布日期
      const publishDate = new Date(categoryStartDate);
      publishDate.setDate(publishDate.getDate() + Math.floor(poemIndex / poemsPerDay));
      
      // 格式化日期为 YYYY-MM-DD
      const dateStr = publishDate.toISOString().split('T')[0];
      
      // 检查是否跳过已存在的诗词
      if (CONFIG.skipExisting) {
        const exists = await checkPoemExists(poem.title, poem.author);
        if (exists) {
          console.log(`跳过已存在诗词: ${poem.title} - ${poem.author}`);
          poemIndex++;
          continue;
        }
      }
      
      // 转换数据格式
      const transformedPoem = transformPoem(poem, dateStr);
      allPoems.push(transformedPoem);
      
      poemIndex++;
    }
    
    // 移动到下一个分类的起始日期
    currentDate.setDate(currentDate.getDate() + CONFIG.daysPerCategory);
  }
  
  console.log(`\n准备导入 ${allPoems.length} 首诗词`);
  
  // 3. 分批导入
  let importedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < allPoems.length; i += CONFIG.batchSize) {
    const batch = allPoems.slice(i, i + CONFIG.batchSize);
    const batchNumber = Math.floor(i / CONFIG.batchSize) + 1;
    const totalBatches = Math.ceil(allPoems.length / CONFIG.batchSize);
    
    console.log(`导入批次 ${batchNumber}/${totalBatches} (${batch.length}首)`);
    
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .insert(batch);
      
      if (error) {
        console.error(`批次 ${batchNumber} 导入失败:`, error.message);
        errorCount += batch.length;
      } else {
        importedCount += batch.length;
        console.log(`批次 ${batchNumber} 导入成功`);
      }
    } catch (error) {
      console.error(`批次 ${batchNumber} 导入异常:`, error.message);
      errorCount += batch.length;
    }
    
    // 添加延迟避免速率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 4. 输出结果
  console.log('\n' + '='.repeat(50));
  console.log('导入完成！');
  console.log(`成功导入: ${importedCount} 首`);
  console.log(`导入失败: ${errorCount} 首`);
  console.log(`跳过重复: ${shiciData.categories.reduce((sum, cat) => sum + cat.poems.length, 0) - allPoems.length} 首`);
  
  if (errorCount > 0) {
    console.log('\n注意：部分诗词导入失败，请检查数据库连接和权限');
  }
}

/**
 * 生成 SQL 文件（备用方案）
 */
function generateSQLFile() {
  console.log('生成 SQL 文件...');
  
  const shiciData = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
  const sqlLines = [];
  let currentDate = new Date(CONFIG.startDate);
  
  sqlLines.push('-- 诗词数据导入 SQL');
  sqlLines.push('-- 生成时间: ' + new Date().toISOString());
  sqlLines.push('-- 数据来源: ' + shiciData.source);
  sqlLines.push('');
  sqlLines.push('INSERT INTO public.question_bank (type, title, content, author, dynasty, enabled, language, status, publish_date, published_at)');
  sqlLines.push('VALUES');
  
  let isFirst = true;
  
  for (const category of shiciData.categories) {
    const categoryStartDate = new Date(currentDate);
    const poemsPerDay = Math.ceil(category.poems.length / CONFIG.daysPerCategory);
    
    let poemIndex = 0;
    
    for (const poem of category.poems) {
      const publishDate = new Date(categoryStartDate);
      publishDate.setDate(publishDate.getDate() + Math.floor(poemIndex / poemsPerDay));
      const dateStr = publishDate.toISOString().split('T')[0];
      const content = poem.content.join('\n').replace(/'/g, "''");
      
      if (!isFirst) {
        sqlLines[ sqlLines.length - 1 ] += ',';
      }
      
      const sqlLine = `    ('poem', '${poem.title.replace(/'/g, "''")}', '${content}', '${(poem.author || '').replace(/'/g, "''")}', '${(poem.dynasty || '').replace(/'/g, "''")}', true, 'zh-CN', 'published', '${dateStr}', now())`;
      sqlLines.push(sqlLine);
      
      isFirst = false;
      poemIndex++;
    }
    
    currentDate.setDate(currentDate.getDate() + CONFIG.daysPerCategory);
  }
  
  sqlLines[ sqlLines.length - 1 ] += ';';
  sqlLines.push('');
  sqlLines.push('-- 导入完成');
  
  const sqlContent = sqlLines.join('\n');
  const outputFile = path.join(__dirname, 'import_shici.sql');
  fs.writeFileSync(outputFile, sqlContent, 'utf8');
  
  console.log(`SQL 文件已生成: ${outputFile}`);
  console.log(`总诗词数: ${shiciData.categories.reduce((sum, cat) => sum + cat.poems.length, 0)}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('诗词数据导入工具');
  console.log('='.repeat(50));
  
  const args = process.argv.slice(2);
  const command = args[0] || 'import';
  
  switch (command) {
    case 'import':
      await importShiciData();
      break;
      
    case 'sql':
      generateSQLFile();
      break;
      
    case 'help':
      console.log(`
可用命令:
  node import_shici.js import    - 直接导入到数据库
  node import_shici.js sql       - 生成 SQL 文件
  node import_shici.js help      - 显示帮助信息

环境变量:
  SUPABASE_URL          - Supabase 项目 URL
  SUPABASE_SERVICE_KEY  - Supabase 服务密钥

配置文件:
  可以在脚本中修改 CONFIG 对象调整导入参数
      `);
      break;
      
    default:
      console.log(`未知命令: ${command}`);
      console.log('使用: node import_shici.js help 查看帮助');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('程序执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  loadShiciData,
  transformPoem,
  importShiciData,
  generateSQLFile,
};