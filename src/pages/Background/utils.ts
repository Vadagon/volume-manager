export function getRandomToken() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = '';
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}

export function fullDaysSinceEpoch() {
  var now = new Date().getTime();
  return Math.floor(now / 8.64e7);
}

export async function hasOffscreenDocument(): Promise<boolean> {
  if ('getContexts' in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });
    return Boolean(contexts.length);
  } else {
    const matchedClients = await new Clients().matchAll();
    return await matchedClients.some((client) => {
      client.url.includes(chrome.runtime.id);
    });
  }
}
