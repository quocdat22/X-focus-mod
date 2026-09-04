// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-focus-mode') {
    chrome.storage.sync.get(['focusEnabled'], (result) => {
      const newState = !result.focusEnabled;
      chrome.storage.sync.set({ focusEnabled: newState });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'toggle-from-popup', focusEnabled: newState },
            () => {
              if (chrome.runtime.lastError) {
                // Tab doesn't have content script, ignore
              }
            }
          );
        }
      });
    });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle-from-popup') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          if (chrome.runtime.lastError) {
            // Ignore error if tab doesn't have content script
          }
          sendResponse(response);
        });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === 'get-state') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'get-state' }, (response) => {
          if (chrome.runtime.lastError) {
            // Ignore error
          }
          sendResponse(response);
        });
      }
    });
    return true;
  }
});
