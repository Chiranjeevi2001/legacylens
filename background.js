chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo === 'complete' && tab.url && tab.url.includes("github.com/")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['contentScript.js']
          });
    }
  });
  