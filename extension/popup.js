const toggle = document.getElementById('focusToggle');
const optionsSection = document.getElementById('optionsSection');
const hideLeftToggle = document.getElementById('hideLeftToggle');
const hideRightToggle = document.getElementById('hideRightToggle');
const statusText = document.getElementById('statusText');

function updateUI(state) {
  const { focusEnabled, hideLeft, hideRight } = state;

  toggle.checked = !!focusEnabled;
  hideLeftToggle.checked = hideLeft !== false;
  hideRightToggle.checked = hideRight !== false;

  if (focusEnabled) {
    optionsSection.classList.remove('hidden');
    if (hideLeft && hideRight) {
      statusText.textContent = 'Focus mode is ON (Both sidebars hidden)';
    } else if (hideLeft) {
      statusText.textContent = 'Focus mode is ON (Left sidebar hidden)';
    } else if (hideRight) {
      statusText.textContent = 'Focus mode is ON (Right sidebar hidden)';
    } else {
      statusText.textContent = 'Focus mode is ON (No sidebars hidden)';
    }
    statusText.className = 'status on';
  } else {
    optionsSection.classList.add('hidden');
    statusText.textContent = 'Focus mode is OFF';
    statusText.className = 'status off';
  }
}

// Get current state on popup open
chrome.storage.sync.get(['focusEnabled', 'hideLeft', 'hideRight'], (result) => {
  const state = {
    focusEnabled: !!result.focusEnabled,
    hideLeft: result.hideLeft !== undefined ? !!result.hideLeft : true,
    hideRight: result.hideRight !== undefined ? !!result.hideRight : true,
  };
  updateUI(state);
});

// Master toggle on switch change
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  const hideLeft = hideLeftToggle.checked;
  const hideRight = hideRightToggle.checked;

  chrome.storage.sync.set({ focusEnabled: enabled }, () => {
    updateUI({ focusEnabled: enabled, hideLeft, hideRight });
  });

  chrome.runtime.sendMessage({ action: 'toggle-from-popup', focusEnabled: enabled });
});

// Left sidebar toggle
hideLeftToggle.addEventListener('change', () => {
  const hideLeft = hideLeftToggle.checked;
  chrome.storage.sync.set({ hideLeft }, () => {
    updateUI({
      focusEnabled: toggle.checked,
      hideLeft,
      hideRight: hideRightToggle.checked,
    });
  });
});

// Right sidebar toggle
hideRightToggle.addEventListener('change', () => {
  const hideRight = hideRightToggle.checked;
  chrome.storage.sync.set({ hideRight }, () => {
    updateUI({
      focusEnabled: toggle.checked,
      hideLeft: hideLeftToggle.checked,
      hideRight,
    });
  });
});
