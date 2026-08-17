import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export function useUrlFilters(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const urlValue = searchParams.get(key);
    filters[key] = urlValue !== null ? urlValue : (defaultValue ?? '');
  }

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setFilters = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === '' || value === null || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  return { filters, setFilter, setFilters };
}
