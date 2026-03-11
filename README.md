# X Focus Mode

A lightweight Chrome extension that hides the left navigation sidebar and right sidebar on X (Twitter), giving you a clean, distraction-free feed.

## Features

- **One-click toggle** via the extension popup
- **Keyboard shortcut** `Alt+Z` to toggle on/off instantly
- **Smooth transitions** — sidebars fade and collapse with CSS animations
- **Persistent state** — your preference is saved across browser sessions and tabs
- **Full-width feed** — the primary column expands to fill the available space when sidebars are hidden
- Works on both `x.com` and `twitter.com`

## Preview

| Focus Mode OFF | Focus Mode ON |
|---|---|
| Default X layout with both sidebars | Clean, centered feed — no distractions |

## Installation

> The extension is not published to the Chrome Web Store. Install it manually as an unpacked extension.

1. Clone or download this repository.
2. Generate the icons (requires Node.js):
   ```bash
   node generate-icons.js
   ```
3. Open Chrome and go to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the `extension/` folder.
6. The X Focus Mode icon will appear in your toolbar.

## Usage

| Action | How |
|---|---|
| Toggle focus mode | Click the extension icon → flip the switch |
| Toggle focus mode | Press `Alt+Z` on any X/Twitter page |

## Project Structure

```
X-focus-mod/
├── extension/
│   ├── manifest.json      # Extension manifest (Manifest V3)
│   ├── background.js      # Service worker — handles commands & message routing
│   ├── content.js         # Injects/removes focus CSS on x.com pages
│   ├── popup.html         # Popup UI
│   ├── popup.js           # Popup logic — reads/writes toggle state
│   └── icons/             # Extension icons (16×16, 48×48, 128×128)
└── generate-icons.js      # Node.js script to generate icon PNGs
```

## Technical Details

- **Manifest V3** Chrome extension
- CSS injection via `<style>` tag with a unique ID, so it can be safely toggled on/off without conflicts
- State persisted with `chrome.storage.sync`, so it syncs across devices if you're signed into Chrome
- Keyboard shortcut is handled at two levels: `chrome.commands` (background) and a `keydown` listener (content script) as fallback

## License

MIT
