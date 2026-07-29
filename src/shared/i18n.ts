/**
 * Every user-visible string goes through `t()`. Keys that are not present in a
 * locale fall back to the English copy passed at the call site, so shipping a
 * new string does not require touching all 54 locale files up front.
 */
export function t(key: string, fallback: string, ...subs: string[]): string {
  try {
    const translated = chrome.i18n.getMessage(key, subs);
    if (translated) return translated;
  } catch {
    /* not running as an extension (e.g. a plain page preview) */
  }
  return subs.reduce(
    (text, value, index) => text.replace(`$${index + 1}`, value),
    fallback
  );
}
