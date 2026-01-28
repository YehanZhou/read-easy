# Chrome 浏览器插件项目

## 项目结构

```
├── manifest.json           # 插件配置文件（必须）
├── popup.html             # 弹窗页面
├── popup.js               # 弹窗脚本
├── content.js             # 内容脚本
├── background.js          # 背景服务脚本
├── styles/
│   └── popup.css          # 弹窗样式
└── images/                # 图标文件夹（可选）
```

## 文件说明

- **manifest.json**: 插件配置清单，定义权限、脚本、图标等信息
- **popup.html/js**: 点击插件图标时显示的弹窗界面
- **content.js**: 在网页页面中执行，可以访问页面DOM
- **background.js**: 后台运行的服务工作线程，处理长期任务和事件
- **popup.css**: 弹窗的样式表

## 安装方法

1. 打开 Chrome 浏览器，输入 `chrome://extensions/`
2. 启用"开发者模式"（右上角切换开关）
3. 点击"加载已解压的扩展程序"
4. 选择本项目文件夹

## 调试

- 在 Chrome 开发者工具中查看 `console` 输出
- 右键点击扩展图标，选择"检查弹窗"来调试弹窗页面
- 在 `chrome://extensions/` 页面中查看错误日志

## Manifest V3 注意事项

- 使用 `service_worker` 而不是 `background` 脚本
- 内容安全策略更严格，不支持内联脚本
- 需要明确声明所有权限

## 常用 Chrome API

- `chrome.tabs.*` - 管理标签页
- `chrome.storage.*` - 存储数据
- `chrome.runtime.*` - 处理消息通信
- `chrome.webRequest.*` - 拦截网络请求
