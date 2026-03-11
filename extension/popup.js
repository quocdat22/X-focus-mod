const toggle = document.getElementById('focusToggle');
const statusText = document.getElementById('statusText');

function updateUI(enabled) {
  toggle.checked = enabled;
  statusText.textContent = enabled ? 'Focus mode is ON' : 'Focus mode is OFF';
  statusText.className = enabled ? 'status on' : 'status off';
}

// Get current state on popup open
chrome.storage.sync.get(['focusEnabled'], (result) => {
  updateUI(!!result.focusEnabled);
});

// Toggle on switch change
toggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({ action: 'toggle-from-popup' }, (response) => {
    if (response) {
      updateUI(response.focusEnabled);
    } else {
      // If content script not available, update storage directly
      const newState = toggle.checked;
      chrome.storage.sync.set({ focusEnabled: newState });
      updateUI(newState);
    }
  });
});
