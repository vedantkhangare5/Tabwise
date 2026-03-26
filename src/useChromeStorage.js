import { useState, useEffect, useRef } from 'react';

/**
 * useChromeStorage
 * A custom hook that keeps a piece of React state synced with chrome.storage.local.
 *
 * @param {string} key       - storage key
 * @param {*}      defaultVal - default value if key is absent in storage
 * @returns [value, setValue, loaded]
 */
export function useChromeStorage(key, defaultVal) {
  const [value, setValueState] = useState(defaultVal);
  const [loaded, setLoaded] = useState(false);
  const skipSave = useRef(true); // prevent writing back on the read cycle

  // On mount: read from chrome.storage.local
  useEffect(() => {
    const isExtension =
      typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

    if (isExtension) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
          setValueState(result[key]);
        }
        skipSave.current = false;
        setLoaded(true);
      });
    } else {
      // Dev / browser preview fallback: use localStorage
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) setValueState(JSON.parse(raw));
      } catch (_) {}
      skipSave.current = false;
      setLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On value change: persist
  useEffect(() => {
    if (skipSave.current) return; // skip the initial read
    const isExtension =
      typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

    if (isExtension) {
      chrome.storage.local.set({ [key]: value });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {}
    }
  }, [key, value]);

  const setValue = (updater) => {
    setValueState((prev) =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  };

  return [value, setValue, loaded];
}
