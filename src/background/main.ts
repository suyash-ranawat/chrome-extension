chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    path: "panel.html",
    enabled: true
  });
});

chrome.action.onClicked.addListener((tab) => {
  // ✅ This callback-based approach satisfies Chrome's gesture requirement
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "panel.html",
    enabled: true
  }, () => {
    chrome.sidePanel.open({ tabId: tab.id });
  });
});
