# TabWise 🔖

> A premium Chrome Extension that replaces your new tab page with a beautiful, glassmorphism-styled bookmark manager.

![TabWise](public/icons/icon128.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Pages** | Top-level categories (Work, Study, Personal, etc.) |
| 📋 **Boards** | Color-coded boards inside each page |
| 🔖 **Bookmarks** | Cards with real favicons, title & URL |
| 🖱️ **Drag & Drop** | Fully reorder pages, boards, and bookmark cards with native HTML5 DnD |
| 😃 **Emoji Picker** | Custom emoji icon picker for your boards |
| 🔍 **Search** | Real-time search — page-scoped or global |
| 💾 **Persistence** | All data synced to `chrome.storage.local` |
| ⚡ **Quick Save** | Press `Ctrl+Shift+Y` → pick a board → saved instantly |
| 📥 **Import** | Bulk import from Chrome bookmarks via folder picker |
| 🖼️ **Wallpapers** | 6 gradient presets + upload any image from your device |
| 🔒 **Privacy Mode** | Blurs all content — click to reveal |

---

## 🗂️ Project Structure

```
tabwise/
├── manifest.json          # Chrome Manifest V3
├── background.js          # Service worker (Quick Save shortcut)
├── newtab.html            # New tab HTML entry point
├── quicksave.html         # Quick Save popup HTML entry point
├── vite.config.js         # Multi-entry Vite build config
├── package.json
├── public/
│   └── icons/             # Extension icons (16, 48, 128px)
└── src/
    ├── App.jsx            # Main dashboard UI
    ├── QuickSave.jsx      # Quick Save popup component
    ├── main.jsx           # New tab React bootstrap
    ├── quicksave-main.jsx # Quick Save React bootstrap
    ├── useChromeStorage.js# chrome.storage.local sync hook
    └── styles.css         # Dark glassmorphism theme
```

---

## 🛠️ Tech Stack

- **React 18** + **Vite 5** — fast build tooling, multi-entry output
- **Chrome Manifest V3** — service worker, storage, bookmarks APIs
- **Vanilla CSS** — glassmorphism, custom animations, no UI library
- **Fonts:** [Syne](https://fonts.google.com/specimen/Syne) (headings) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body)

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Build the extension
```bash
npm run build
```

### 3. Copy extension files into dist
```bash
# PowerShell
Copy-Item manifest.json, background.js -Destination dist\ -Force
```

### 4. Load in Chrome
1. Open **Chrome** → go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the **`dist/`** folder
5. Open a new tab — TabWise appears! 🎉

> **After any code change:** run `npm run build`, re-copy the two files above, then click **🔄 Refresh** on the TabWise card in `chrome://extensions`.

---

## 🔑 Keyboard Shortcut

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+Y` | Quick Save the current tab |

A small popup opens where you pick the target page and board. The bookmark is saved directly to `chrome.storage.local`.

---

## 🖼️ Wallpapers

- **6 gradient presets** — Midnight, Forest, Ember, Ocean, Nebula, Dusk
- **Custom image** — upload any photo from your device (stored as base64)

---

## 💡 How Data is Stored

All data (pages, boards, bookmarks, wallpaper preference) is persisted via `chrome.storage.local` using the custom `useChromeStorage` hook in `src/useChromeStorage.js`. Default sample data is loaded **only on first launch** when storage is completely empty.

---

## 📦 Development

Run a local dev server (limited — Chrome APIs won't be available, but UI is previewable):
```bash
npm run dev
```
The app falls back to `localStorage` automatically when `chrome.storage` isn't available

---

## 📜 Permissions Used

| Permission | Why |
|---|---|
| `storage` | Persist all bookmark data |
| `bookmarks` | Read Chrome bookmark folders for import |
| `activeTab` / `tabs` | Get current tab info for Quick Save |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed change.

---

## 📄 License

MIT
