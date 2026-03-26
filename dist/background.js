// TabWise Background Service Worker (Manifest V3)
// Listens for the Ctrl+Shift+Y command and opens the Quick Save popup.

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'quick-save') return;

  // Get the currently active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  // Store the tab info temporarily so quicksave.html can read it
  await chrome.storage.local.set({
    tabwise_quicksave_tab: {
      title: tab.title || 'Untitled',
      url: tab.url || '',
      favicon: tab.favIconUrl || null,
    },
  });

  // Open the Quick Save popup window
  chrome.windows.create({
    url: chrome.runtime.getURL('quicksave.html'),
    type: 'popup',
    width: 420,
    height: 480,
    focused: true,
  });
});
