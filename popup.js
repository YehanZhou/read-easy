// popup.js - 朗读控制脚本 with modern UI

let isSpeaking = false;
let isPaused = false;
let currentRate = 1;

// DOM Elements
const playBtn = document.getElementById('playBtn');
const playBtnText = document.getElementById('playBtnText');
const playBtnIcon = playBtn.querySelector('.btn-icon');
const stopBtn = document.getElementById('stopBtn');
const rateSlider = document.getElementById('rateSlider');
const rateValue = document.getElementById('rateValue');
const statusText = document.getElementById('status');
const statusTime = document.getElementById('statusTime');
const statusDot = document.getElementById('statusDot');
const message = document.getElementById('message');

// SVG Icons
const playIcon = '<path d="M8 5v14l11-7z"/>';
const pauseIcon = '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>';

// 更新语速显示（实时更新）
rateSlider.addEventListener('input', async (e) => {
  currentRate = parseFloat(e.target.value);
  rateValue.textContent = currentRate.toFixed(1) + 'x';

  // 如果正在朗读，则发送速率更新消息
  if (isSpeaking) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'updateRate', rate: currentRate },
        (response) => {
          if (!response || !response.success) {
            console.log('速率更新失败');
          }
        }
      );
    } catch (error) {
      console.error('更新速率错误:', error);
    }
  }
});

// 播放/暂停/继续 按钮逻辑
playBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!isSpeaking) {
      // 开始朗读
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'startReading', rate: currentRate },
        (response) => {
          if (chrome.runtime.lastError) {
            showError(`无法朗读：${chrome.runtime.lastError.message}`);
          } else if (response && response.success) {
            isSpeaking = true;
            isPaused = false;
            updateUI();
            updateStatus('正在朗读...', 'active');
          } else {
            showError(response?.error || '朗读失败');
            updateStatus('朗读失败', 'error');
          }
        }
      );
    } else if (isPaused) {
      // 继续朗读
      chrome.tabs.sendMessage(tab.id, { action: 'resumeReading' }, (response) => {
        if (response && response.success) {
          isPaused = false;
          updateUI();
          updateStatus('继续朗读...', 'active');
        }
      });
    } else {
      // 暂停朗读
      chrome.tabs.sendMessage(tab.id, { action: 'pauseReading' }, (response) => {
        if (response && response.success) {
          isPaused = true;
          updateUI();
          updateStatus('已暂停', 'idle');
        }
      });
    }
  } catch (error) {
    showError(`错误: ${error.message}`);
    updateStatus('出错', 'error');
  }
});

// 停止朗读
stopBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: 'stopReading' }, (response) => {
      if (response && response.success) {
        isSpeaking = false;
        isPaused = false;
        updateUI();
        updateStatus('已停止', 'idle');
      }
    });
  } catch (error) {
    showError(`错误: ${error.message}`);
  }
});

// 监听来自content.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'readingFinished') {
    isSpeaking = false;
    isPaused = false;
    updateUI();
    updateStatus('朗读完成', 'idle');
  } else if (request.action === 'readingError') {
    showError(request.error);
    updateStatus('出错', 'error');
  }
});

function updateUI() {
  stopBtn.disabled = !isSpeaking;

  // Update play button state
  if (!isSpeaking) {
    // 未朗读状态 - 显示播放按钮
    playBtn.disabled = false;
    playBtnText.textContent = '开始';
    playBtnIcon.innerHTML = playIcon;
    playBtn.setAttribute('aria-label', '开始朗读');
  } else if (isPaused) {
    // 暂停状态 - 显示继续播放按钮
    playBtn.disabled = false;
    playBtnText.textContent = '继续';
    playBtnIcon.innerHTML = playIcon;
    playBtn.setAttribute('aria-label', '继续朗读');
  } else {
    // 正在朗读 - 显示暂停按钮
    playBtn.disabled = false;
    playBtnText.textContent = '暂停';
    playBtnIcon.innerHTML = pauseIcon;
    playBtn.setAttribute('aria-label', '暂停朗读');
  }
}

function updateStatus(text, state = 'idle') {
  statusText.textContent = text;

  // Update status dot
  statusDot.className = 'status-dot ' + state;

  // Update time indicator
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  statusTime.textContent = timeStr;
}

function showError(text) {
  message.textContent = text;
  message.className = 'message error';
  setTimeout(() => {
    message.className = 'message';
  }, 5000);
}

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  updateStatus('准备就绪', 'idle');
});
