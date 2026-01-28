// content.js - 朗读功能实现

let currentUtterance = null;
let paragraphs = [];
let currentIndex = 0;
let highlightedElement = null;

// 添加高亮样式
const styleEl = document.createElement('style');
styleEl.textContent = `
  .read-easy-highlight {
    background-color: #d3d3d3 !important;
    color: #000 !important;
    transition: background-color 0.3s ease;
  }
`;
document.head.appendChild(styleEl);

// 提取页面中的段落文本
function extractParagraphs() {
  paragraphs = [];
  const selectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'div[role="article"]'];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length > 0) {
        paragraphs.push({
          element: el,
          text: text
        });
      }
    });
  });

  return paragraphs;
}

// 清除上一个高亮
function clearHighlight() {
  if (highlightedElement) {
    highlightedElement.classList.remove('read-easy-highlight');
    highlightedElement = null;
  }
}

// 高亮当前段落
function highlightParagraph(index) {
  clearHighlight();
  if (paragraphs[index]) {
    paragraphs[index].element.classList.add('read-easy-highlight');
    paragraphs[index].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightedElement = paragraphs[index].element;
  }
}

// 朗读文本
function readText(text, rate = 1) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    // 停止之前的朗读
    window.speechSynthesis.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = rate;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;

    // 尝试设置中文语言
    currentUtterance.lang = 'zh-CN';

    currentUtterance.onend = () => {
      resolve();
    };

    currentUtterance.onerror = (event) => {
      reject(new Error(`朗读错误: ${event.error}`));
    };

    window.speechSynthesis.speak(currentUtterance);
  });
}

// 开始朗读
async function startReading(rate = 1) {
  try {
    paragraphs = extractParagraphs();

    if (paragraphs.length === 0) {
      throw new Error('未找到可朗读的文本');
    }

    currentIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      currentIndex = i;
      highlightParagraph(i);

      await readText(paragraphs[i].text, rate);

      // 等待一小段时间再读下一段
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 朗读完成
    clearHighlight();
    chrome.runtime.sendMessage({ action: 'readingFinished' });
  } catch (error) {
    clearHighlight();
    chrome.runtime.sendMessage({
      action: 'readingError',
      error: error.message
    });
  }
}

// 从指定位置继续朗读
async function resumeFromIndex(startIndex = 0, rate = 1) {
  try {
    for (let i = startIndex; i < paragraphs.length; i++) {
      currentIndex = i;
      highlightParagraph(i);

      await readText(paragraphs[i].text, rate);

      // 等待一小段时间再读下一段
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 朗读完成
    clearHighlight();
  } catch (error) {
    clearHighlight();
    throw error;
  }
}

// 暂停朗读
function pauseReading() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

// 继续朗读
function resumeReading() {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

// 停止朗读
function stopReading() {
  window.speechSynthesis.cancel();
  clearHighlight();
  paragraphs = [];
  currentIndex = 0;
}

// 朗读状态标志
let isReading = false;
let readingRate = 1;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startReading') {
    isReading = true;
    readingRate = request.rate;
    // 立即返回成功响应
    sendResponse({ success: true });
    // 异步执行朗读任务
    startReading(request.rate)
      .then(() => {
        isReading = false;
        chrome.runtime.sendMessage({ action: 'readingFinished' });
      })
      .catch(error => {
        isReading = false;
        chrome.runtime.sendMessage({
          action: 'readingError',
          error: error.message
        });
      });
  } else if (request.action === 'pauseReading') {
    pauseReading();
    sendResponse({ success: true });
  } else if (request.action === 'resumeReading') {
    resumeReading();
    sendResponse({ success: true });
  } else if (request.action === 'stopReading') {
    isReading = false;
    stopReading();
    sendResponse({ success: true });
  } else if (request.action === 'updateRate') {
    if (isReading) {
      // 停止当前朗读，以新速率继续
      readingRate = request.rate;
      const savedIndex = currentIndex;
      stopReading();

      // 从当前段落重新开始
      currentIndex = savedIndex;
      isReading = true;
      paragraphs = extractParagraphs();
      resumeFromIndex(savedIndex, request.rate)
        .then(() => {
          isReading = false;
          chrome.runtime.sendMessage({ action: 'readingFinished' });
        })
        .catch(error => {
          isReading = false;
          chrome.runtime.sendMessage({
            action: 'readingError',
            error: error.message
          });
        });
    }
    sendResponse({ success: true });
  }
});

console.log('朗读助手已加载');
