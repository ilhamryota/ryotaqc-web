import { useEffect, useState } from "react";

/**
 * Debounces any reactive value. Returns the value after `delay` ms of stability.
 * Reusable across global search, admin filters, and any text-driven query.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
