(() => {
  'use strict';

  const STYLE_ID = 'x-focus-mode-styles';
  const SCROLL_THRESHOLD = 300;

  let focusEnabled = false;
  let hideLeft = true;
  let hideRight = true;
  let autoHideEnabled = false;
  let lastScrollY = 0;
  let scrollHidden = false;

  // Generate CSS based on which sidebars are hidden
  function generateFocusCSS(left, right) {
    if (!left && !right) {
      return '';
    }

    let css = '';

    if (left) {
      css += `
    /* Left sidebar - navigation header */
    header[role="banner"] {
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      flex: 0 0 0px !important;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      flex-basis: 0 !important;
      overflow: hidden !important;
      transition: opacity 0.3s ease, width 0.3s ease, max-width 0.3s ease !important;
    }

    /* Hide the left sidebar container width */
    header[role="banner"] > div {
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      transition: width 0.3s ease !important;
    }

    /* Allow the sibling container containing main to center properly */
    header[role="banner"] + div {
      width: 100% !important;
      max-width: 100% !important;
      align-items: center !important;
      justify-content: center !important;
    }
      `;
    }

    if (right) {
      css += `
    /* Right sidebar */
    [data-testid="sidebarColumn"] {
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      overflow: hidden !important;
      flex: 0 0 0px !important;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      flex-basis: 0 !important;
      transition: opacity 0.3s ease, width 0.3s ease, max-width 0.3s ease !important;
    }
      `;
    }

    if (left && right) {
      css += `
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
    div:has(> [data-testid="primaryColumn"]),
    main[role="main"] > div > div {
      max-width: 100% !important;
      width: 100% !important;
      justify-content: center !important;
    }
      `;
    } else if (left && !right) {
      css += `
    /* Left hidden, Right visible: center feed + sidebar together with no middle gap */
    main[role="main"] {
      width: 100% !important;
      max-width: 100% !important;
      flex-grow: 1 !important;
      display: flex !important;
      justify-content: center !important;
      transition: all 0.3s ease !important;
    }

    main[role="main"] > div {
      width: 100% !important;
      max-width: 100% !important;
      display: flex !important;
      justify-content: center !important;
    }

    /* The flex container holding primary feed and right sidebar */
    div:has(> [data-testid="primaryColumn"]),
    main[role="main"] > div > div {
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      width: auto !important;
      max-width: 100% !important;
      gap: 30px !important;
    }

    /* Primary feed: standard fixed width, no rogue margins */
    [data-testid="primaryColumn"] {
      width: 600px !important;
      max-width: 600px !important;
      margin: 0 !important;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      transition: width 0.3s ease, max-width 0.3s ease !important;
    }

    [data-testid="primaryColumn"] > div > div {
      max-width: 100% !important;
    }

    /* Right sidebar: standard width, placed next to feed with 30px gap */
    [data-testid="sidebarColumn"] {
      width: 350px !important;
      max-width: 350px !important;
      margin: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      transition: width 0.3s ease, max-width 0.3s ease !important;
    }

    @media (max-width: 1095px) {
      [data-testid="sidebarColumn"] {
        width: 290px !important;
        max-width: 290px !important;
      }
    }
      `;
    } else if (!left && right) {
      css += `
    main[role="main"] {
      flex-grow: 1 !important;
      transition: all 0.3s ease !important;
    }

    [data-testid="primaryColumn"] {
      max-width: 900px !important;
      width: 100% !important;
      transition: max-width 0.3s ease !important;
    }

    [data-testid="primaryColumn"] > div > div {
      max-width: 100% !important;
    }
      `;
    }

    return css;
  }

  // Transition-ready CSS (applied always so transitions are smooth)
  const transitionCSS = `
    header[role="banner"] {
      transition: opacity 0.3s ease, width 0.3s ease, max-width 0.3s ease !important;
    }
    [data-testid="sidebarColumn"] {
      transition: opacity 0.3s ease, width 0.3s ease, max-width 0.3s ease !important;
    }
    [data-testid="primaryColumn"] {
      transition: max-width 0.3s ease, width 0.3s ease !important;
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

  function applyStyles() {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    if (focusEnabled) {
      styleEl.textContent = generateFocusCSS(hideLeft, hideRight);
    } else {
      styleEl.textContent = '';
    }
  }

  function toggleFocusMode() {
    focusEnabled = !focusEnabled;
    chrome.storage.sync.set({ focusEnabled });
    applyStyles();
    return focusEnabled;
  }

  // Auto-hide on scroll
  function handleScroll() {
    if (!focusEnabled) return;

    const currentScrollY = window.scrollY;

    if (currentScrollY > SCROLL_THRESHOLD && currentScrollY > lastScrollY) {
      // Scrolling down past threshold
      scrollHidden = true;
    } else if (currentScrollY < lastScrollY && scrollHidden) {
      // Scrolling up
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
      sendResponse({ focusEnabled: newState, hideLeft, hideRight });
    }
    if (message.action === 'toggle-from-popup') {
      if (message.focusEnabled !== undefined) {
        focusEnabled = !!message.focusEnabled;
        applyStyles();
      }
      sendResponse({ focusEnabled, hideLeft, hideRight });
    }
    if (message.action === 'get-state') {
      sendResponse({ focusEnabled, hideLeft, hideRight });
    }
  });

  // Listen for storage changes from popup or other tabs
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;

    let changed = false;
    if (changes.focusEnabled !== undefined) {
      focusEnabled = !!changes.focusEnabled.newValue;
      changed = true;
    }
    if (changes.hideLeft !== undefined) {
      hideLeft = changes.hideLeft.newValue !== false;
      changed = true;
    }
    if (changes.hideRight !== undefined) {
      hideRight = changes.hideRight.newValue !== false;
      changed = true;
    }

    if (changed) {
      applyStyles();
    }
  });

  // Scroll listener with passive flag for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize: load saved state
  function init() {
    injectTransitionStyles();
    chrome.storage.sync.get(['focusEnabled', 'hideLeft', 'hideRight'], (result) => {
      focusEnabled = !!result.focusEnabled;
      hideLeft = result.hideLeft !== undefined ? !!result.hideLeft : true;
      hideRight = result.hideRight !== undefined ? !!result.hideRight : true;
      applyStyles();
    });
  }

  // Run init when DOM is ready
  if (document.head) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
