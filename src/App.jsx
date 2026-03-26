import { useState, useEffect, useRef, useCallback } from 'react';
import { useChromeStorage } from './useChromeStorage.js';

// ─── Default Sample Data ────────────────────────────────────────────────────
const DEFAULT_DATA = {
  pages: [
    {
      id: 1,
      name: 'Work',
      icon: '💼',
      boards: [
        {
          id: 101,
          name: 'Dev Resources',
          color: '#f59e0b',
          cards: [
            { id: 1001, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', favicon: null },
            { id: 1002, title: 'GitHub', url: 'https://github.com', favicon: null },
            { id: 1003, title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: null },
          ],
        },
        {
          id: 102,
          name: 'Design Tools',
          color: '#8b5cf6',
          cards: [
            { id: 1004, title: 'Figma', url: 'https://figma.com', favicon: null },
            { id: 1005, title: 'Dribbble', url: 'https://dribbble.com', favicon: null },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Study',
      icon: '📖',
      boards: [
        {
          id: 201,
          name: 'ML & AI',
          color: '#10b981',
          cards: [
            { id: 2001, title: 'Kaggle', url: 'https://kaggle.com', favicon: null },
            { id: 2002, title: 'Papers With Code', url: 'https://paperswithcode.com', favicon: null },
          ],
        },
        {
          id: 202,
          name: 'C Programming',
          color: '#3b82f6',
          cards: [
            { id: 2003, title: 'GeeksForGeeks', url: 'https://geeksforgeeks.org', favicon: null },
            { id: 2004, title: 'cppreference', url: 'https://cppreference.com', favicon: null },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Personal',
      icon: '🌙',
      boards: [
        {
          id: 301,
          name: 'Entertainment',
          color: '#ec4899',
          cards: [
            { id: 3001, title: 'YouTube', url: 'https://youtube.com', favicon: null },
            { id: 3002, title: 'Spotify', url: 'https://spotify.com', favicon: null },
          ],
        },
      ],
    },
  ],
};

const WALLPAPERS = [
  { name: 'Midnight', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Forest',   bg: 'linear-gradient(135deg, #0a3d2e 0%, #145c40 50%, #1a7a54 100%)' },
  { name: 'Ember',    bg: 'linear-gradient(135deg, #2d1b00 0%, #7c3100 55%, #a84400 100%)' },
  { name: 'Ocean',    bg: 'linear-gradient(135deg, #001529 0%, #003566 55%, #0077b6 100%)' },
  { name: 'Nebula',   bg: 'linear-gradient(135deg, #1a0533 0%, #3d0e61 45%, #6b21a8 100%)' },
  { name: 'Dusk',     bg: 'linear-gradient(135deg, #1a0a00 0%, #7f3f00 45%, #b06020 100%)' },
];

const BOARD_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899', '#f97316', '#06b6d4', '#84cc16'];

function faviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

function FaviconImg({ url, title }) {
  const [errored, setErrored] = useState(false);
  const src = faviconUrl(url);
  if (!src || errored) {
    return <span className="card-favicon-emoji">🔗</span>;
  }
  return (
    <img
      className="card-favicon"
      src={src}
      alt={title}
      onError={() => setErrored(true)}
    />
  );
}

// ─── Import Dialog ───────────────────────────────────────────────────────────
function ImportDialog({ data, onImport, onClose }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [targetPageId, setTargetPageId] = useState(data.pages[0]?.id ?? null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const isExtension = typeof chrome !== 'undefined' && chrome.bookmarks;
    if (!isExtension) {
      setFolders([{ id: 'demo', title: 'Demo Folder', children: [{ title: 'Example', url: 'https://example.com' }] }]);
      setLoading(false);
      return;
    }
    chrome.bookmarks.getTree((tree) => {
      const flatten = (nodes) => {
        const result = [];
        for (const node of nodes) {
          if (!node.url && node.children) {
            const bookmarks = node.children.filter((c) => c.url);
            if (bookmarks.length > 0 || node.title) {
              result.push({ id: node.id, title: node.title || 'Untitled', children: node.children });
            }
            result.push(...flatten(node.children));
          }
        }
        return result;
      };
      const all = flatten(tree);
      // Filter out root nodes and keep user-created folders with bookmarks
      const withBMs = all.filter((f) => f.children && f.children.some((c) => c.url));
      setFolders(withBMs);
      setLoading(false);
    });
  }, []);

  const toggleFolder = (id) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    if (selectedFolderIds.length === 0 || !targetPageId) return;
    setImporting(true);
    const selectedFolders = folders.filter((f) => selectedFolderIds.includes(f.id));
    const newBoards = selectedFolders.map((folder) => ({
      id: Date.now() + Math.random(),
      name: folder.title,
      color: BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)],
      cards: folder.children
        .filter((c) => c.url)
        .map((c) => ({
          id: Date.now() + Math.random(),
          title: c.title || c.url,
          url: c.url,
          favicon: null,
        })),
    }));
    onImport(targetPageId, newBoards);
  };

  return (
    <div className="dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog-box">
        <div>
          <div className="dialog-title">📥 Import from Chrome</div>
          <div className="dialog-subtitle">Select bookmark folders to import as boards</div>
        </div>

        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
            Loading bookmarks…
          </div>
        ) : folders.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            No bookmark folders with bookmarks found.
          </div>
        ) : (
          <div className="import-folder">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`import-folder-item ${selectedFolderIds.includes(folder.id) ? 'selected' : ''}`}
                onClick={() => toggleFolder(folder.id)}
              >
                <span>📁</span>
                <span style={{ flex: 1 }}>{folder.title}</span>
                <span className="import-folder-count">
                  {folder.children.filter((c) => c.url).length} bookmarks
                </span>
              </div>
            ))}
          </div>
        )}

        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'DM Sans'", marginBottom: 8 }}>
            Import into page:
          </div>
          <select
            className="target-select"
            value={targetPageId ?? ''}
            onChange={(e) => setTargetPageId(Number(e.target.value))}
          >
            {data.pages.map((p) => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>

        <div className="dialog-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            style={{ opacity: selectedFolderIds.length === 0 ? 0.5 : 1 }}
            disabled={selectedFolderIds.length === 0 || importing}
            onClick={handleImport}
          >
            {importing ? 'Importing…' : `Import ${selectedFolderIds.length} folder(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData, loaded] = useChromeStorage('tabwise_data', null);
  // wallpaper: { type: 'preset', idx: number } | { type: 'custom', url: string }
  const [wallpaperState, setWallpaperState] = useChromeStorage('tabwise_wallpaper', { type: 'preset', idx: 0 });

  // Once storage loads, seed default data only on first launch (empty storage)
  useEffect(() => {
    if (loaded && data === null) {
      setData(DEFAULT_DATA);
    }
  }, [loaded, data, setData]);

  const [privacyMode, setPrivacyMode] = useState(false);
  const fileInputRef = useRef(null);

  const [activePageId, setActivePageId] = useState(null);
  const [search, setSearch] = useState('');
  const [searchScope, setSearchScope] = useState('page'); // 'page' | 'global'

  // UI state
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('📁');
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [addCardBoardId, setAddCardBoardId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardUrl, setNewCardUrl] = useState('');
  const [showImport, setShowImport] = useState(false);

  // DnD state
  const dragCard = useRef(null);   // { cardId, fromBoardId, fromPageId }
  const [dragOverBoardId, setDragOverBoardId] = useState(null);

  const wallpaperPickerRef = useRef(null);

  // Set active page once data loads
  useEffect(() => {
    if (data && activePageId === null) {
      setActivePageId(data.pages[0]?.id ?? null);
    }
  }, [data, activePageId]);

  // Close wallpaper picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wallpaperPickerRef.current && !wallpaperPickerRef.current.contains(e.target)) {
        setShowWallpaperPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activePage = data?.pages.find((p) => p.id === activePageId);

  // ── Search / filter ────────────────────────────────────────────────────────
  const getFilteredBoards = () => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return activePage?.boards ?? [];
    if (searchScope === 'global') {
      // Collect matching cards from ALL pages, group by board
      const results = [];
      for (const page of data.pages) {
        for (const board of page.boards) {
          const matchedCards = board.cards.filter(
            (c) => c.title.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
          );
          if (matchedCards.length) results.push({ ...board, cards: matchedCards, _page: page.name });
        }
      }
      return results;
    }
    return (activePage?.boards ?? []).map((board) => ({
      ...board,
      cards: board.cards.filter(
        (c) => c.title.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
      ),
    }));
  };

  const filteredBoards = getFilteredBoards();

  // ── Data mutations ─────────────────────────────────────────────────────────
  const addPage = () => {
    if (!newPageName.trim()) return;
    const newPage = { id: Date.now(), name: newPageName.trim(), icon: newPageIcon, boards: [] };
    setData((d) => ({ ...d, pages: [...d.pages, newPage] }));
    setNewPageName('');
    setNewPageIcon('📁');
    setShowAddPage(false);
    setActivePageId(newPage.id);
  };

  const deletePage = (pageId) => {
    setData((d) => {
      const remaining = d.pages.filter((p) => p.id !== pageId);
      return { ...d, pages: remaining };
    });
    setActivePageId((prev) => {
      const remaining = data.pages.filter((p) => p.id !== pageId);
      return remaining[0]?.id ?? null;
    });
  };

  const addBoard = () => {
    if (!newBoardName.trim()) return;
    const newBoard = {
      id: Date.now(),
      name: newBoardName.trim(),
      color: BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)],
      cards: [],
    };
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === activePageId ? { ...p, boards: [...p.boards, newBoard] } : p
      ),
    }));
    setNewBoardName('');
    setShowAddBoard(false);
  };

  const addCard = (boardId) => {
    const title = newCardTitle.trim();
    let url = newCardUrl.trim();
    if (!title || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const card = { id: Date.now(), title, url, favicon: null };
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === activePageId
          ? { ...p, boards: p.boards.map((b) => (b.id === boardId ? { ...b, cards: [...b.cards, card] } : b)) }
          : p
      ),
    }));
    setNewCardTitle('');
    setNewCardUrl('');
    setAddCardBoardId(null);
  };

  const deleteCard = useCallback((boardId, cardId) => {
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) => ({
        ...p,
        boards: p.boards.map((b) =>
          b.id === boardId ? { ...b, cards: b.cards.filter((c) => c.id !== cardId) } : b
        ),
      })),
    }));
  }, [setData]);

  const deleteBoard = (boardId) => {
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === activePageId ? { ...p, boards: p.boards.filter((b) => b.id !== boardId) } : p
      ),
    }));
  };

  // ── Import handler ─────────────────────────────────────────────────────────
  const handleImport = (targetPageId, newBoards) => {
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === targetPageId ? { ...p, boards: [...p.boards, ...newBoards] } : p
      ),
    }));
    setShowImport(false);
  };

  // ── Drag & Drop (native HTML5) ─────────────────────────────────────────────
  const handleDragStart = (e, card, fromBoardId) => {
    dragCard.current = { card, fromBoardId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, toBoardId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBoardId(toBoardId);
  };

  const handleDrop = (e, toBoardId) => {
    e.preventDefault();
    setDragOverBoardId(null);
    if (!dragCard.current) return;
    const { card, fromBoardId } = dragCard.current;
    if (fromBoardId === toBoardId) return;

    setData((d) => ({
      ...d,
      pages: d.pages.map((p) => ({
        ...p,
        boards: p.boards.map((b) => {
          if (b.id === fromBoardId) return { ...b, cards: b.cards.filter((c) => c.id !== card.id) };
          if (b.id === toBoardId) return { ...b, cards: [...b.cards, card] };
          return b;
        }),
      })),
    }));
    dragCard.current = null;
  };

  const handleDragEnd = () => {
    setDragOverBoardId(null);
    dragCard.current = null;
  };

  // ─── Wallpaper helpers ─────────────────────────────────────────────────────
  const isCustomWallpaper = wallpaperState?.type === 'custom' && wallpaperState?.url;
  const wallpaperBg = isCustomWallpaper
    ? `url("${wallpaperState.url}") center/cover no-repeat`
    : WALLPAPERS[wallpaperState?.idx ?? 0]?.bg ?? WALLPAPERS[0].bg;

  const handleWallpaperUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate it's an image and not insanely large (warn at 3MB)
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setWallpaperState({ type: 'custom', url: ev.target.result });
      setShowWallpaperPicker(false);
    };
    reader.readAsDataURL(file);
    // Reset so selecting same file again triggers onChange
    e.target.value = '';
  };

  const removeCustomWallpaper = () => {
    setWallpaperState({ type: 'preset', idx: 0 });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!loaded || !data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: WALLPAPERS[0].bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>
          Loading TabWise…
        </div>
      </div>
    );
  }

  // Hidden file input for custom wallpaper
  const wallpaperFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={handleWallpaperUpload}
    />
  );

  const totalBookmarks = data.pages.reduce((a, p) => a + p.boards.reduce((b, board) => b + board.cards.length, 0), 0);
  const totalBoards = data.pages.reduce((a, p) => a + p.boards.length, 0);

  return (
    <>
      {/* Privacy overlay — click to dismiss */}
      {privacyMode && (
        <div className="privacy-overlay" onClick={() => setPrivacyMode(false)}>
          <div className="pi-icon">🔒</div>
          <div className="pi-text">Privacy Mode Active</div>
          <div className="pi-sub">Click anywhere to reveal</div>
        </div>
      )}

      {wallpaperFileInput}

      <div
        className={`app-wrapper${privacyMode ? ' privacy-mode' : ''}`}
        style={{ background: wallpaperBg }}
      >
        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <header className="topbar">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">T</div>
            <span className="logo-text">Tab<span>Wise</span></span>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchScope === 'global' ? 'Search all pages…' : 'Search bookmarks…'}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Search scope toggle */}
          {search && (
            <div style={{ display: 'flex', gap: 4 }}>
              {['page', 'global'].map((s) => (
                <button
                  key={s}
                  className={`ctrl-btn${searchScope === s ? ' active' : ''}`}
                  style={{ padding: '6px 11px', fontSize: 12 }}
                  onClick={() => setSearchScope(s)}
                >
                  {s === 'page' ? '📄 Page' : '🌐 Global'}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="topbar-controls">
            {/* Wallpaper picker */}
            <div className="wallpaper-wrap" ref={wallpaperPickerRef}>
              <button
                className="ctrl-btn"
                onClick={() => setShowWallpaperPicker((v) => !v)}
              >
                🖼 Wallpaper
              </button>
              {showWallpaperPicker && (
                <div className="wallpaper-dropdown">
                  {/* Section: Presets */}
                  <div className="wp-section-label">Gradient Presets</div>
                  <div className="wp-preset-grid">
                    {WALLPAPERS.map((w, i) => (
                      <button
                        key={w.name}
                        className={`wallpaper-preset-btn${
                          !isCustomWallpaper && (wallpaperState?.idx ?? 0) === i ? ' selected' : ''
                        }`}
                        style={{ background: w.bg }}
                        title={w.name}
                        onClick={() => {
                          setWallpaperState({ type: 'preset', idx: i });
                          setShowWallpaperPicker(false);
                        }}
                      >
                        <span className="wp-preset-name">{w.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="wp-divider" />

                  {/* Section: Custom */}
                  <div className="wp-section-label">Custom Image</div>
                  <button
                    className="wp-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span>📁</span> Upload from Device
                  </button>
                  {isCustomWallpaper && (
                    <button
                      className="wp-remove-btn"
                      onClick={() => { removeCustomWallpaper(); setShowWallpaperPicker(false); }}
                    >
                      <span>✕</span> Remove Custom Wallpaper
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              className={`ctrl-btn${privacyMode ? ' active' : ''}`}
              onClick={() => setPrivacyMode((v) => !v)}
            >
              {privacyMode ? '🔒' : '👁'} Privacy
            </button>

            <button
              className="ctrl-btn"
              onClick={() => setShowImport(true)}
            >
              📥 Import
            </button>
          </div>
        </header>

        {/* ── Main Layout ──────────────────────────────────────────────────── */}
        <div className="main-layout">
          {/* Sidebar */}
          <nav className="sidebar">
            <div className="sidebar-label">Pages</div>

            {data.pages.map((page) => (
              <button
                key={page.id}
                className={`page-btn${page.id === activePageId ? ' active' : ''}`}
                onClick={() => { setActivePageId(page.id); setSearch(''); }}
              >
                <span className="page-icon">{page.icon}</span>
                <span className="page-name">{page.name}</span>
                <span className="page-count">{page.boards.length}</span>
              </button>
            ))}

            {/* Add Page */}
            {showAddPage ? (
              <div className="add-page-form fade-in">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="sidebar-input"
                    style={{ width: 36, padding: '7px', textAlign: 'center', flexShrink: 0 }}
                    value={newPageIcon}
                    onChange={(e) => setNewPageIcon(e.target.value)}
                    maxLength={2}
                  />
                  <input
                    className="sidebar-input"
                    autoFocus
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPage()}
                    placeholder="Page name…"
                  />
                </div>
                <div className="add-page-actions">
                  <button className="btn-primary-sm" onClick={addPage}>Add</button>
                  <button className="btn-ghost-sm" onClick={() => { setShowAddPage(false); setNewPageName(''); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="new-page-btn" onClick={() => setShowAddPage(true)}>
                + New Page
              </button>
            )}

            <div className="sidebar-stats">
              {data.pages.length} pages<br />
              {totalBoards} boards · {totalBookmarks} bookmarks
            </div>
          </nav>

          {/* Content */}
          <main className="content-area">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">
                  {activePage?.icon} {activePage?.name}
                  {search && searchScope === 'global' && (
                    <span style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 10 }}>
                      — global results
                    </span>
                  )}
                </h1>
                <p className="page-subtitle">
                  {search
                    ? `${filteredBoards.reduce((a, b) => a + b.cards.length, 0)} results for "${search}"`
                    : `${activePage?.boards.length ?? 0} boards · ${activePage?.boards.reduce((a, b) => a + b.cards.length, 0) ?? 0} bookmarks`
                  }
                </p>
              </div>
              <div className="page-actions">
                {activePage && data.pages.length > 1 && (
                  <button
                    className="btn-secondary"
                    style={{ color: 'rgba(255,100,100,0.8)', fontSize: 12, padding: '8px 12px' }}
                    onClick={() => {
                      if (window.confirm(`Delete page "${activePage.name}" and all its boards?`)) {
                        deletePage(activePageId);
                      }
                    }}
                  >
                    🗑 Delete Page
                  </button>
                )}
                <button className="btn-primary" onClick={() => setShowAddBoard(true)}>
                  + New Board
                </button>
              </div>
            </div>

            {/* Add Board Bar */}
            {showAddBoard && (
              <div className="add-board-bar fade-in-up">
                <input
                  className="modal-input"
                  autoFocus
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBoard()}
                  placeholder="Board name…"
                />
                <button className="btn-create" onClick={addBoard}>Create</button>
                <button className="btn-icon-close" onClick={() => { setShowAddBoard(false); setNewBoardName(''); }}>✕</button>
              </div>
            )}

            {/* Boards Grid */}
            <div className="boards-grid">
              {filteredBoards.map((board, bIdx) => (
                <div
                  key={board.id}
                  className={`board-card${dragOverBoardId === board.id ? ' drag-over' : ''}`}
                  style={{
                    borderTop: `3px solid ${board.color}`,
                    animationDelay: `${bIdx * 0.05}s`,
                  }}
                  onDragOver={(e) => handleDragOver(e, board.id)}
                  onDrop={(e) => handleDrop(e, board.id)}
                  onDragLeave={() => setDragOverBoardId(null)}
                >
                  {/* Board Header */}
                  <div className="board-header">
                    <div className="board-title-row">
                      <div className="board-dot" style={{ background: board.color }} />
                      <span className="board-name">{board.name}</span>
                      {board._page && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans'" }}>
                          · {board._page}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="board-count">{board.cards.length}</span>
                      {!board._page && (
                        <button
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.2)', fontSize: 13,
                            padding: '2px 5px', borderRadius: 5,
                            transition: 'color 0.2s',
                          }}
                          title="Delete board"
                          onClick={() => {
                            if (window.confirm(`Delete board "${board.name}"?`)) deleteBoard(board.id);
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ff7070')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="cards-list">
                    {board.cards.map((card) => (
                      <div
                        key={card.id}
                        className="card-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, card, board.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => window.open(card.url, '_blank', 'noopener')}
                      >
                        <FaviconImg url={card.url} title={card.title} />
                        <div className="card-body">
                          <div className="card-title">{card.title}</div>
                          <div className="card-url">{card.url}</div>
                        </div>
                        <button
                          className="card-delete"
                          onClick={(e) => { e.stopPropagation(); deleteCard(board.id, card.id); }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {board.cards.length === 0 && !search && (
                      <div style={{
                        padding: '12px 0',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.18)',
                        fontSize: 12,
                        fontFamily: "'DM Sans'",
                      }}>
                        Drop cards here or add one below
                      </div>
                    )}
                  </div>

                  {/* Add Card */}
                  {!board._page && (
                    addCardBoardId === board.id ? (
                      <div className="add-card-form">
                        <input
                          className="card-input"
                          autoFocus
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          placeholder="Title…"
                        />
                        <input
                          className="card-input"
                          value={newCardUrl}
                          onChange={(e) => setNewCardUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCard(board.id)}
                          placeholder="https://…"
                        />
                        <div className="add-card-actions">
                          <button
                            className="btn-add-card"
                            style={{ background: board.color }}
                            onClick={() => addCard(board.id)}
                          >
                            Add
                          </button>
                          <button
                            className="btn-cancel-card"
                            onClick={() => { setAddCardBoardId(null); setNewCardTitle(''); setNewCardUrl(''); }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-add-bookmark"
                        onClick={() => setAddCardBoardId(board.id)}
                      >
                        + Add bookmark
                      </button>
                    )
                  )}
                </div>
              ))}

              {/* Empty state */}
              {filteredBoards.length === 0 && (
                <div className="empty-boards">
                  {search ? (
                    <>
                      <div className="empty-icon">🔍</div>
                      <div className="empty-title">No results for "{search}"</div>
                      <div className="empty-sub">Try a different keyword or switch to global search</div>
                    </>
                  ) : (
                    <>
                      <div className="empty-icon">📭</div>
                      <div className="empty-title">No boards yet</div>
                      <div className="empty-sub">Click "New Board" to get started</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Import Dialog */}
      {showImport && (
        <ImportDialog
          data={data}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </>
  );
}
