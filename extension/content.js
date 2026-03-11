(() => {
  'use strict';

  const STYLE_ID = 'x-focus-mode-styles';
  const SCROLL_THRESHOLD = 300;

  let focusEnabled = false;
  let autoHideEnabled = false;
  let lastScrollY = 0;
  let scrollHidden = false;

  // CSS to hide sidebars with smooth transitions
  const focusCSS = `
    /* Left sidebar - navigation header */
    header[role="banner"] {
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      min-width: 0 !important;
      overflow: hidden !important;
      transition: opacity 0.3s ease, width 0.3s ease !important;
    }

    /* Hide the left sidebar container width */
    header[role="banner"] > div {
      width: 0 !important;
      min-width: 0 !important;
      transition: width 0.3s ease !important;
    }

    /* Right sidebar */
    [data-testid="sidebarColumn"] {
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      min-width: 0 !important;
      overflow: hidden !important;
      transition: opacity 0.3s ease, width 0.3s ease !important;
    }

    /* Make the main wrapper expand to full width */
    main[role="main"] {
      width: 100% !important;
      max-width: 100% !important;
      transition: all 0.3s ease !important;
    }

    /* The flex container holding all 3 columns */
    main[role="main"] > div {
      max-width: 100% !important;
      width: 100% !important;
    }

    /* Primary column - the feed content */
    [data-testid="primaryColumn"] {
      max-width: 900px !important;
      width: 100% !important;
      margin: 0 auto !important;
      flex-grow: 1 !important;
      transition: max-width 0.3s ease !important;
    }

    /* Target the inner content wrapper that X uses for fixed-width layout */
    [data-testid="primaryColumn"] > div > div {
      max-width: 100% !important;
    }

    /* The parent flex row that holds sidebar + primary + right sidebar */
    main[role="main"] > div > div {
      max-width: 100% !important;
      width: 100% !important;
      justify-content: center !important;
    }
  `;

  // Transition-ready CSS (applied always so transitions are smooth)
  const transitionCSS = `
    header[role="banner"] {
      transition: opacity 0.3s ease, width 0.3s ease !important;
    }
    [data-testid="sidebarColumn"] {
      transition: opacity 0.3s ease, width 0.3s ease !important;
    }
    [data-testid="primaryColumn"] {
      transition: max-width 0.3s ease !important;
    }
  `;

  function injectTransitionStyles() {
    if (!document.getElementById('x-focus-mode-transitions')) {
      const style = document.createElement('style');
      style.id = 'x-focus-mode-transitions';
      style.textContent = transitionCSS;
      document.head.appendChild(style);
    }
  }

  function enableFocusMode() {
    focusEnabled = true;
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = focusCSS;
    chrome.storage.sync.set({ focusEnabled: true });
  }

  function disableFocusMode() {
    focusEnabled = false;
    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl) {
      styleEl.textContent = '';
    }
    chrome.storage.sync.set({ focusEnabled: false });
  }

  function toggleFocusMode() {
    if (focusEnabled) {
      disableFocusMode();
    } else {
      enableFocusMode();
    }
    return focusEnabled;
  }

  // Auto-hide on scroll
  function handleScroll() {
    if (!focusEnabled) return;

    const currentScrollY = window.scrollY;

    if (currentScrollY > SCROLL_THRESHOLD && currentScrollY > lastScrollY) {
      // Scrolling down past threshold — ensure hidden (already hidden by focus mode)
      scrollHidden = true;
    } else if (currentScrollY < lastScrollY && scrollHidden) {
      // Scrolling up — could temporarily show sidebars if desired
      // For now, focus mode stays active until toggled off
      scrollHidden = false;
    }

    lastScrollY = currentScrollY;
  }

  // Listen for keyboard shortcut Alt+Z (fallback for when chrome.commands doesn't work)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      toggleFocusMode();
    }
  });

  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle') {
      const newState = toggleFocusMode();
      sendResponse({ focusEnabled: newState });
    }
    if (message.action === 'get-state') {
      sendResponse({ focusEnabled });
    }
  });

  // Scroll listener with passive flag for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize: load saved state
  function init() {
    injectTransitionStyles();
    chrome.storage.sync.get(['focusEnabled'], (result) => {
      if (result.focusEnabled) {
        enableFocusMode();
      }
    });
  }

  // Run init when DOM is ready
  if (document.head) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
