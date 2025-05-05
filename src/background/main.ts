// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Search.com Extension installed or updated');
  
  // Set default options for side panel
  chrome.sidePanel.setOptions({
    path: "panel.html",
    enabled: true
  });
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel when the extension icon is clicked
  // This callback-based approach satisfies Chrome's gesture requirement
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "panel.html",
    enabled: true
  }, () => {
    chrome.sidePanel.open({ tabId: tab.id });
  });
});

// Listen for authentication messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_STATE_CHANGED') {
    // Update the extension's badge based on authentication state
    if (message.isAuthenticated) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' }); // Green color
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
    sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async response
});

// Check auth state on startup and update badge accordingly
chrome.storage.local.get(['authToken'], (result) => {
  if (result.authToken) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' }); // Green color
  }
});