# 朗读助手 (Read Easy)

一个帮助你朗读网页文本的 Chrome 浏览器扩展程序

## 主要功能

- **网页文本朗读**：自动提取并朗读页面中的段落、标题、列表等内容
- **实时高亮显示**：正在朗读的段落会被高亮显示，便于跟踪阅读进度
- **播放控制**：支持开始、暂停、继续、停止等操作
- **语速调整**：可在朗读过程中实时调整语速（0.5x - 2x）
- **现代 UI**：采用 Glassmorphism 设计风格，支持深浅配色
- **状态指示**：实时显示朗读状态和时间戳

## 项目结构

```
├── manifest.json           # 插件配置文件（必须）
├── popup.html             # 弹窗页面
├── popup.js               # 弹窗控制脚本
├── content.js             # 网页内容脚本（朗读和高亮实现）
├── background.js          # 后台服务脚本
├── styles/
│   └── popup.css          # 弹窗样式
└── README.md              # 项目说明
```

## 文件说明

- **manifest.json**: 扩展程序配置清单，定义权限、脚本、图标等信息
- **popup.html**: 弹窗页面 HTML 结构
- **popup.js**: 弹窗的交互逻辑和状态管理
- **content.js**: 在网页中执行，负责提取文本、朗读和实现高亮效果
- **background.js**: 后台服务脚本
- **popup.css**: 采用现代设计的弹窗样式表

## 快速开始

### 安装方法

1. 打开 Chrome 浏览器，输入 `chrome://extensions/`
2. 启用右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目文件夹

### 使用方法

1. 打开任意网页（如新闻网站、博客等）
2. 点击工具栏中的扩展程序图标
3. 点击"开始"按钮开始朗读
4. 使用暂停/继续/停止按钮控制朗读
5. 调整语速滑块实时改变朗读速度

## 调试

- 打开网页的开发者工具（F12）查看 console 输出
- 右键点击扩展图标，选择"检查弹窗"来调试弹窗页面
- 在 `chrome://extensions/` 页面中查看详细的错误日志

## 技术实现

- **Manifest V3**：使用最新的扩展程序标准
- **Web Speech API**：用于文本转语音功能
- **Chrome Message API**：popup 和 content 脚本间的通信
- **DOM 操作**：提取和高亮网页文本

## Manifest V3 注意事项

- 使用 `service_worker` 替代 `background` 脚本
- 内容安全策略更严格，不支持内联脚本
- 需要明确声明所有权限

## 常用 Chrome API

- `chrome.tabs.*` - 管理标签页
- `chrome.storage.*` - 本地数据存储
- `chrome.runtime.*` - 处理消息通信
- `window.speechSynthesis` - 文本转语音 API

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于 Chromium 的浏览器

## 许可证

MIT

