/**
 * Promise wrapper over chrome.storage.local. Values round-trip as-is; the old
 * implementation wrote under one key and read from another, which is why
 * nothing ever persisted.
 */

export async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const bag = await chrome.storage.local.get(key);
    return key in bag && bag[key] !== undefined ? (bag[key] as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function write(key: string, value: unknown): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch {
    /* storage quota / teardown - nothing actionable */
  }
}

export function watch<T>(key: string, onChange: (value: T) => void): void {
  chrome.storage.local.onChanged.addListener((changes) => {
    if (key in changes) onChange(changes[key].newValue as T);
  });
}

/** Hostname of a tab URL, or null for chrome://, about: and friends. */
export function hostnameOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return hostname || null;
  } catch {
    return null;
  }
}
