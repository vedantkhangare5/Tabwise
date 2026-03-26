import { useState } from "react";

const initialData = {
  pages: [
    {
      id: 1,
      name: "Work",
      icon: "💼",
      boards: [
        {
          id: 101,
          name: "Dev Resources",
          color: "#f59e0b",
          cards: [
            { id: 1001, title: "MDN Web Docs", url: "https://developer.mozilla.org", favicon: "🌐" },
            { id: 1002, title: "GitHub", url: "https://github.com", favicon: "🐙" },
            { id: 1003, title: "Stack Overflow", url: "https://stackoverflow.com", favicon: "📚" },
          ],
        },
        {
          id: 102,
          name: "Design Tools",
          color: "#8b5cf6",
          cards: [
            { id: 1004, title: "Figma", url: "https://figma.com", favicon: "🎨" },
            { id: 1005, title: "Dribbble", url: "https://dribbble.com", favicon: "🏀" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Study",
      icon: "📖",
      boards: [
        {
          id: 201,
          name: "ML & AI",
          color: "#10b981",
          cards: [
            { id: 2001, title: "Kaggle", url: "https://kaggle.com", favicon: "📊" },
            { id: 2002, title: "Papers With Code", url: "https://paperswithcode.com", favicon: "🧠" },
          ],
        },
        {
          id: 202,
          name: "C Programming",
          color: "#3b82f6",
          cards: [
            { id: 2003, title: "GeeksForGeeks", url: "https://geeksforgeeks.org", favicon: "💻" },
            { id: 2004, title: "cppreference", url: "https://cppreference.com", favicon: "📘" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Personal",
      icon: "🌙",
      boards: [
        {
          id: 301,
          name: "Entertainment",
          color: "#ec4899",
          cards: [
            { id: 3001, title: "YouTube", url: "https://youtube.com", favicon: "▶️" },
            { id: 3002, title: "Spotify", url: "https://spotify.com", favicon: "🎵" },
          ],
        },
      ],
    },
  ],
};

const wallpapers = [
  { name: "Midnight", bg: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" },
  { name: "Forest", bg: "linear-gradient(135deg, #0a3d2e, #145c40, #1a7a54)" },
  { name: "Ember", bg: "linear-gradient(135deg, #2d1b00, #7c3100, #a84400)" },
  { name: "Ocean", bg: "linear-gradient(135deg, #001529, #003566, #0077b6)" },
];

export default function TabWise() {
  const [data, setData] = useState(initialData);
  const [activePageId, setActivePageId] = useState(1);
  const [search, setSearch] = useState("");
  const [wallpaper, setWallpaper] = useState(wallpapers[0]);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [addCardBoardId, setAddCardBoardId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardUrl, setNewCardUrl] = useState("");
  const [theme, setTheme] = useState("dark");

  const activePage = data.pages.find((p) => p.id === activePageId);

  const filteredBoards = activePage?.boards.map((board) => ({
    ...board,
    cards: board.cards.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.url.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const addPage = () => {
    if (!newPageName.trim()) return;
    const newPage = { id: Date.now(), name: newPageName, icon: "📁", boards: [] };
    setData((d) => ({ ...d, pages: [...d.pages, newPage] }));
    setNewPageName("");
    setShowAddPage(false);
    setActivePageId(newPage.id);
  };

  const addBoard = () => {
    if (!newBoardName.trim()) return;
    const colors = ["#f59e0b", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899", "#f97316"];
    const newBoard = {
      id: Date.now(),
      name: newBoardName,
      color: colors[Math.floor(Math.random() * colors.length)],
      cards: [],
    };
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === activePageId ? { ...p, boards: [...p.boards, newBoard] } : p
      ),
    }));
    setNewBoardName("");
    setShowAddBoard(false);
  };

  const addCard = (boardId) => {
    if (!newCardTitle.trim() || !newCardUrl.trim()) return;
    const card = { id: Date.now(), title: newCardTitle, url: newCardUrl, favicon: "🔗" };
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId ? { ...b, cards: [...b.cards, card] } : b
              ),
            }
          : p
      ),
    }));
    setNewCardTitle("");
    setNewCardUrl("");
    setAddCardBoardId(null);
  };

  const deleteCard = (boardId, cardId) => {
    setData((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId ? { ...b, cards: b.cards.filter((c) => c.id !== cardId) } : b
              ),
            }
          : p
      ),
    }));
  };

  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: wallpaper.bg,
        fontFamily: "'Syne', sans-serif",
        display: "flex",
        flexDirection: "column",
        filter: privacyMode ? "blur(8px)" : "none",
        transition: "filter 0.3s ease",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .page-btn { transition: all 0.2s ease; }
        .page-btn:hover { transform: translateX(4px); }
        .card-item { transition: all 0.2s ease; }
        .card-item:hover { transform: translateY(-2px); }
        .board-card { transition: all 0.25s ease; }
        .board-card:hover { transform: translateY(-3px); }
        .icon-btn { transition: all 0.15s ease; cursor: pointer; }
        .icon-btn:hover { opacity: 0.7; transform: scale(1.1); }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .delete-btn { opacity: 0; transition: opacity 0.2s; }
        .card-item:hover .delete-btn { opacity: 1; }
      `}</style>

      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 28px",
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800,
          }}>T</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Tab<span style={{ color: "#f59e0b" }}>Wise</span>
          </span>
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: 340 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            style={{
              width: "100%", padding: "9px 16px 9px 36px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12, color: "#fff", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <button
              className="icon-btn"
              onClick={() => setShowWallpaperPicker(!showWallpaperPicker)}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 14 }}
            >🖼 Wallpaper</button>
            {showWallpaperPicker && (
              <div style={{
                position: "absolute", right: 0, top: 44, zIndex: 100,
                background: "rgba(20,20,30,0.95)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12,
                display: "flex", flexDirection: "column", gap: 8, width: 170,
              }}>
                {wallpapers.map((w) => (
                  <button key={w.name} onClick={() => { setWallpaper(w); setShowWallpaperPicker(false); }}
                    style={{
                      padding: "8px 12px", border: "none", borderRadius: 8, cursor: "pointer",
                      background: w.bg, color: "#fff", fontFamily: "'Syne',sans-serif",
                      fontWeight: 600, fontSize: 13,
                      outline: wallpaper.name === w.name ? "2px solid #f59e0b" : "none",
                    }}>{w.name}</button>
                ))}
              </div>
            )}
          </div>
          <button
            className="icon-btn"
            onClick={() => setPrivacyMode(!privacyMode)}
            style={{ background: privacyMode ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 14 }}
          >{privacyMode ? "🔒" : "👁"} Privacy</button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 220, padding: "24px 14px",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column", gap: 6,
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "0 8px 10px" }}>Pages</div>

          {data.pages.map((page) => (
            <button
              key={page.id}
              className="page-btn"
              onClick={() => setActivePageId(page.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activePageId === page.id ? "rgba(245,158,11,0.2)" : "transparent",
                color: activePageId === page.id ? "#f59e0b" : "rgba(255,255,255,0.7)",
                fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 14,
                textAlign: "left",
                outline: activePageId === page.id ? "1px solid rgba(245,158,11,0.4)" : "none",
              }}
            >
              <span style={{ fontSize: 16 }}>{page.icon}</span>
              {page.name}
            </button>
          ))}

          {showAddPage ? (
            <div style={{ padding: "8px 6px", display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                autoFocus
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPage()}
                placeholder="Page name..."
                style={{
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8, color: "#fff", padding: "7px 10px", fontSize: 13,
                  fontFamily: "'DM Sans',sans-serif", outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addPage} style={{ flex: 1, background: "#f59e0b", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, padding: "6px", cursor: "pointer", fontSize: 12 }}>Add</button>
                <button onClick={() => setShowAddPage(false)} style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, color: "#fff", padding: "6px", cursor: "pointer", fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddPage(true)}
              style={{
                margin: "6px 0", padding: "9px 12px", borderRadius: 10,
                border: "1px dashed rgba(255,255,255,0.2)", background: "transparent",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13,
                fontFamily: "'Syne',sans-serif", display: "flex", alignItems: "center", gap: 8,
              }}
            >+ New Page</button>
          )}

          {/* Stats */}
          <div style={{ marginTop: "auto", padding: "14px 8px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
              {data.pages.length} pages · {data.pages.reduce((a, p) => a + p.boards.length, 0)} boards
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                {activePage?.icon} {activePage?.name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>
                {activePage?.boards.length} boards · {activePage?.boards.reduce((a, b) => a + b.cards.length, 0)} bookmarks
              </p>
            </div>
            <button
              onClick={() => setShowAddBoard(true)}
              style={{
                padding: "10px 18px", background: "linear-gradient(135deg, #f59e0b, #f97316)",
                border: "none", borderRadius: 10, color: "#000", fontWeight: 700,
                fontSize: 14, cursor: "pointer", fontFamily: "'Syne',sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >+ New Board</button>
          </div>

          {/* Add Board Modal */}
          {showAddBoard && (
            <div style={{
              background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
              padding: 20, marginBottom: 24, display: "flex", gap: 10, alignItems: "center",
            }} className="fade-in">
              <input
                autoFocus
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBoard()}
                placeholder="Board name..."
                style={{
                  flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 9, color: "#fff", padding: "10px 14px", fontSize: 14,
                  fontFamily: "'DM Sans',sans-serif", outline: "none",
                }}
              />
              <button onClick={addBoard} style={{ background: "#f59e0b", border: "none", borderRadius: 9, color: "#000", fontWeight: 700, padding: "10px 18px", cursor: "pointer", fontSize: 14 }}>Create</button>
              <button onClick={() => setShowAddBoard(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 9, color: "#fff", padding: "10px 14px", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          )}

          {/* Boards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filteredBoards?.map((board) => (
              <div
                key={board.id}
                className="board-card fade-in"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderTop: `3px solid ${board.color}`,
                  borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12,
                }}
              >
                {/* Board Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: board.color }} />
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{board.name}</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{board.cards.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {board.cards.map((card) => (
                    <div
                      key={card.id}
                      className="card-item"
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 9,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(card.url, "_blank")}
                    >
                      <span style={{ fontSize: 16 }}>{card.favicon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.title}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.url}</div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); deleteCard(board.id, card.id); }}
                        style={{ background: "rgba(255,80,80,0.2)", border: "none", borderRadius: 6, color: "#ff6b6b", padding: "3px 7px", cursor: "pointer", fontSize: 11 }}
                      >✕</button>
                    </div>
                  ))}
                </div>

                {/* Add Card */}
                {addCardBoardId === board.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }} className="fade-in">
                    <input
                      autoFocus
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Title..."
                      style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 13,
                        fontFamily: "'DM Sans',sans-serif", outline: "none",
                      }}
                    />
                    <input
                      value={newCardUrl}
                      onChange={(e) => setNewCardUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCard(board.id)}
                      placeholder="https://..."
                      style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 13,
                        fontFamily: "'DM Sans',sans-serif", outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => addCard(board.id)} style={{ flex: 1, background: board.color, border: "none", borderRadius: 8, color: "#000", fontWeight: 700, padding: "7px", cursor: "pointer", fontSize: 13 }}>Add</button>
                      <button onClick={() => setAddCardBoardId(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", padding: "7px 12px", cursor: "pointer", fontSize: 13 }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddCardBoardId(board.id)}
                    style={{
                      padding: "8px", border: `1px dashed rgba(255,255,255,0.15)`,
                      borderRadius: 9, background: "transparent", color: "rgba(255,255,255,0.35)",
                      cursor: "pointer", fontSize: 13, fontFamily: "'Syne',sans-serif",
                    }}
                  >+ Add bookmark</button>
                )}
              </div>
            ))}

            {filteredBoards?.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>No boards yet</div>
                <div style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 6 }}>Click "New Board" to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
