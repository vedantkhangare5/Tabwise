import { useState, useEffect } from 'react';

const WALLPAPER = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';

export default function QuickSave() {
  const [tabInfo, setTabInfo] = useState(null);
  const [data, setData] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isExt = typeof chrome !== 'undefined' && chrome.storage;
    if (!isExt) {
      // Dev fallback
      setTabInfo({ title: 'Example Page', url: 'https://example.com', favicon: null });
      setData({
        pages: [{ id: 1, name: 'Work', icon: '💼', boards: [{ id: 101, name: 'Dev Resources', color: '#f59e0b', cards: [] }] }],
      });
      setSelectedPageId(1);
      setSelectedBoardId(101);
      setLoading(false);
      return;
    }
    chrome.storage.local.get(['tabwise_quicksave_tab', 'tabwise_data'], (result) => {
      const tab = result.tabwise_quicksave_tab;
      const d = result.tabwise_data;
      setTabInfo(tab || { title: 'Unknown Tab', url: '', favicon: null });
      if (d) {
        setData(d);
        const firstPage = d.pages[0];
        if (firstPage) {
          setSelectedPageId(firstPage.id);
          setSelectedBoardId(firstPage.boards[0]?.id ?? null);
        }
      }
      setLoading(false);
    });
  }, []);

  const handlePageChange = (pageId) => {
    setSelectedPageId(Number(pageId));
    const page = data.pages.find((p) => p.id === Number(pageId));
    setSelectedBoardId(page?.boards[0]?.id ?? null);
  };

  const handleSave = () => {
    if (!data || !selectedBoardId || !tabInfo?.url) return;
    const newCard = {
      id: Date.now(),
      title: tabInfo.title || tabInfo.url,
      url: tabInfo.url,
      favicon: null,
    };
    const updatedData = {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        boards: p.boards.map((b) =>
          b.id === selectedBoardId ? { ...b, cards: [...b.cards, newCard] } : b
        ),
      })),
    };

    const isExt = typeof chrome !== 'undefined' && chrome.storage;
    if (isExt) {
      chrome.storage.local.set({ tabwise_data: updatedData }, () => {
        setSaved(true);
        setTimeout(() => window.close(), 1200);
      });
    } else {
      setSaved(true);
      setTimeout(() => window.close(), 1200);
    }
  };

  const activePage = data?.pages.find((p) => p.id === selectedPageId);
  const activeBoards = activePage?.boards ?? [];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: WALLPAPER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans'" }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: WALLPAPER,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        animation: 'scaleIn 0.22s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Syne'", fontWeight: 800, color: '#000', fontSize: 16,
          }}>T</div>
          <span style={{ fontFamily: "'Syne'", fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '-0.5px' }}>
            Tab<span style={{ color: '#f59e0b' }}>Wise</span> Quick Save
          </span>
        </div>

        {/* Tab Preview */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {tabInfo?.favicon ? (
            <img src={tabInfo.favicon} style={{ width: 20, height: 20, borderRadius: 4 }} alt="" />
          ) : (
            <span style={{ fontSize: 18 }}>🔗</span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tabInfo?.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
              {tabInfo?.url}
            </div>
          </div>
        </div>

        {/* Page Selector */}
        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Page
          </label>
          <select
            className="target-select"
            value={selectedPageId ?? ''}
            onChange={(e) => handlePageChange(e.target.value)}
          >
            {data?.pages.map((p) => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>

        {/* Board Selector */}
        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Board
          </label>
          {activeBoards.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '10px 0' }}>
              No boards in this page. Create one in the new tab first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeBoards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => setSelectedBoardId(board.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: selectedBoardId === board.id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${selectedBoardId === board.id ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    color: selectedBoardId === board.id ? '#f59e0b' : 'rgba(255,255,255,0.8)',
                    fontFamily: "'DM Sans'",
                    fontSize: 14,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: board.color, flexShrink: 0 }} />
                  <span>{board.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    {board.cards.length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {saved ? (
          <div style={{
            background: 'rgba(16,185,129,0.2)',
            border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 12,
            padding: '14px',
            textAlign: 'center',
            color: '#34d399',
            fontFamily: "'Syne'",
            fontWeight: 700,
            fontSize: 15,
            animation: 'fadeInUp 0.25s ease',
          }}>
            ✅ Saved! Closing…
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => window.close()}
              style={{
                flex: 1,
                padding: '11px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 11,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: "'Syne'",
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedBoardId}
              style={{
                flex: 2,
                padding: '11px',
                background: selectedBoardId ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 11,
                color: selectedBoardId ? '#000' : 'rgba(255,255,255,0.3)',
                fontFamily: "'Syne'",
                fontWeight: 700,
                fontSize: 14,
                cursor: selectedBoardId ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              💾 Save Bookmark
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
