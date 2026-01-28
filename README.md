# 🎋 古诗词猜字游戏

一个优雅的古诗词猜字游戏，通过猜测汉字来完成经典古诗词。

![游戏预览](https://img.shields.io/badge/游戏类型-古诗词猜字-blue) ![技术栈](https://img.shields.io/badge/技术栈-原生JavaScript-green) ![响应式](https://img.shields.io/badge/响应式-支持-orange)

## 🚀 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/sniper1211/Blackout-Guess.git
   cd Blackout-Guess
   ```

2. **运行游戏**
   - 直接打开 `index.html` 文件
   - 或使用本地服务器：`python -m http.server 8000`
   - 访问 `http://localhost:8000`

3. **开始游戏**
   - 在输入框中输入汉字
   - 按回车或点击"猜测文字"按钮
   - 完成古诗词即可获胜！

## ✨ 游戏特色

### 🎯 核心玩法
- **古诗词猜字**：通过猜测汉字逐步揭示经典古诗词
- **智能提示**：提供有限次数的提示帮助
- **实时反馈**：即时显示猜测结果和进度

### 🎮 游戏功能
- 🎵 **音效系统**：成功、失败、胜利等音效反馈
- 🌙 **主题切换**：亮色/暗色主题，支持系统偏好
- 🏆 **排行榜**：记录最高分，挑战自我
- ⌨️ **快捷键**：支持键盘操作，提升游戏体验
- 📱 **响应式**：完美适配桌面、平板、手机

### 📊 计分系统
- **基础得分**：根据字符难度获得不同分数
- **连击奖励**：连续猜对获得额外奖励
- **速度奖励**：快速完成获得时间奖励
- **准确率奖励**：高准确率获得精准奖励

## 🎮 操作指南

### 基本操作
- `Enter` - 提交猜测
- `Ctrl/Cmd + H` - 使用提示

### 游戏界面
- **诗词显示区**：显示当前古诗词的猜测进度
- **输入区域**：输入要猜测的汉字
- **统计信息**：显示猜测次数、用时、得分
- **已猜字符**：显示已经猜过的字符

## 🛠️ 技术实现

### 技术栈
- **前端**：原生JavaScript (ES6+)
- **样式**：CSS3 + CSS变量 + Flexbox
- **音频**：Web Audio API
- **存储**：LocalStorage

### 项目结构
```
Blackout-Guess/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── js/
│   ├── GameEngine.js   # 游戏逻辑核心
│   ├── UIManager.js    # 界面管理器
│   ├── AudioManager.js # 音效管理器
│   └── app.js          # 主应用程序
└── README.md           # 项目说明
```

### 核心特性
- **模块化架构**：清晰的代码结构，易于维护
- **响应式设计**：适配各种屏幕尺寸
- **无障碍支持**：ARIA标签，键盘导航
- **性能优化**：高效的DOM操作和事件处理

## 📱 兼容性

| 浏览器 | 版本要求 | 支持状态 |
|--------|----------|----------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 12+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| 移动端 | 现代浏览器 | ✅ 完全支持 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔮 未来规划

- [ ] 添加更多朝代的诗词
- [ ] 实现在线排行榜
- [ ] 添加诗词背景介绍
- [ ] 支持自定义诗词
- [ ] 添加成就系统

---

**享受古诗词的魅力，在游戏中学习传统文化！** 🎋✨
