import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(enabled));
  }, [enabled]);

  return [enabled, setEnabled];
}
