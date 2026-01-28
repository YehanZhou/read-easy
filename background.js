// background.js - 背景服务工作线程

// 监听扩展程序被安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('扩展程序已安装');
    // 初始化存储
    chrome.storage.local.set({ count: 0 });
  } else if (details.reason === 'update') {
    console.log('扩展程序已更新');
  }
});

// 监听来自popup或content的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  sendResponse({ status: 'ok' });
});
