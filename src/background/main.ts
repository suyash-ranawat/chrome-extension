// src/background/main.ts

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Search.com Extension installed or updated');
  
  // Set default options for side panel
  chrome.sidePanel.setOptions({
    path: "panel.html",
    enabled: true
  });
  
  // Register the omnibox keyword
  chrome.omnibox.setDefaultSuggestion({
    description: 'Search with SearchGPT: %s'
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
  } else if (message.type === 'OPEN_SIDE_PANEL') {
    // Open the side panel when requested from the content script
    const tab = sender.tab;
    if (tab && tab.id) {
      chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "panel.html",
        enabled: true
      }, () => {
        chrome.sidePanel.open({ tabId: tab.id });
      });
    }
    sendResponse({ success: true });
  } else if (message.type === 'MAKE_DEFAULT_SEARCH') {
    // Handle making SearchGPT the default search engine
    handleMakeDefault(message.query || '');
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

// Handle omnibox input
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  // Always suggest searching with SearchGPT
  suggest([
    {content: text, description: `<match>SearchGPT:</match> ${text}`}
  ]);
});

// Handle omnibox selection
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  // Check if this is the first time using SearchGPT
  chrome.storage.local.get(['searchgpt_default_confirmed'], (result) => {
    const isFirstUse = !result.searchgpt_default_confirmed;
    
    if (isFirstUse) {
      // First time - ask user if they want to make SearchGPT default
      showMakeDefaultConfirmation(text);
    } else {
      // Already confirmed - just search
      performSearch(text, disposition);
    }
  });
});

// Function to show a simple confirmation dialog
function showMakeDefaultConfirmation(query) {
  // Create a simple alert-style confirmation
  chrome.tabs.create({ url: 'about:blank' }, (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (searchQuery) => {
        const result = confirm('Make SearchGPT your default search engine?\n\nThis will allow you to search directly from the address bar.');
        
        // Send result back to background script
        chrome.runtime.sendMessage({
          type: 'DEFAULT_CONFIRMATION_RESULT',
          confirmed: result,
          query: searchQuery
        });
      },
      args: [query]
    });
  });
}

// Listen for confirmation result
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DEFAULT_CONFIRMATION_RESULT') {
    // Close the confirmation tab
    chrome.tabs.remove(sender.tab.id);
    
    // Handle the result
    if (message.confirmed) {
      // User confirmed - remember the choice
      chrome.storage.local.set({ searchgpt_default_confirmed: true });
      
      // Try to register as default search engine
      handleMakeDefault(message.query);
    } else {
      // User declined - just perform the search
      performSearch(message.query, 'currentTab');
    }
  }
  
  return true;
});

// Function to handle making SearchGPT the default search
function handleMakeDefault(query) {
  // Chrome doesn't allow extensions to directly set the default search engine
  // We'll attempt to do this via the Chrome search settings
  chrome.tabs.create({ 
    url: 'chrome://settings/searchEngines',
    active: true
  }, (tab) => {
    // Give user instructions in a notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Set SearchGPT as Default',
      message: 'To make SearchGPT your default search engine, find it in the list and click "Make default"',
      priority: 2
    });
    
    // After a delay, execute the search
    setTimeout(() => {
      performSearch(query, 'newTab');
    }, 1000);
  });
}

// Function to perform the search
function performSearch(query, disposition) {
  const searchUrl = `https://search.com/search?q=${encodeURIComponent(query)}`;
  
  switch (disposition) {
    case 'currentTab':
      chrome.tabs.update({ url: searchUrl });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ url: searchUrl });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ url: searchUrl, active: false });
      break;
    case 'newTab':
      chrome.tabs.create({ url: searchUrl });
      break;
    default:
      chrome.tabs.create({ url: searchUrl });
  }
}
