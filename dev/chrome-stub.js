/**
 * Development-only stand-in for the chrome.* APIs, so the real popup bundle can
 * be opened in an ordinary browser tab for visual review without loading the
 * extension. Not part of the build - webpack never sees this directory.
 *
 * Set `window.PREVIEW = { theme, captured }` before loading this file.
 */
(function stubChrome() {
  const cfg = Object.assign({ theme: 'light', captured: true }, window.PREVIEW);

  const store = {
    'vc.theme': cfg.theme,
    'vc.review-hidden': false,
    'vc.per-domain': { 'vimeo.com': { volume: 240, preset: 'flat' } },
  };

  let audio = cfg.captured ? { volume: 180, preset: 'bass' } : null;

  const favicon = (fill) =>
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        `<rect width="32" height="32" rx="7" fill="${fill}"/>` +
        '<path d="M12 10l11 6-11 6z" fill="#fff"/></svg>'
    );

  const TABS = [
    {
      id: 1,
      url: 'https://vimeo.com/ghosts',
      title: 'Ghosts of the Arctic on Vimeo',
      favIconUrl: favicon('#17b5e6'),
    },
    {
      id: 2,
      url: 'https://youtube.com/watch',
      title: 'Jamiroquai — Stillness in Time — YouTube',
      favIconUrl: favicon('#f03'),
    },
    {
      id: 3,
      url: 'https://open.spotify.com/mix',
      title: 'Daily Mix 3 — Spotify Web Player',
      favIconUrl: favicon('#1db954'),
    },
  ];

  window.chrome = {
    runtime: {
      id: 'preview0000000000000000000000000',
      sendMessage: async (message) => {
        if (message.op === 'read-tab') return audio;
        if (message.op === 'write-volume') {
          audio = {
            volume: message.volume,
            preset: (audio && audio.preset) || 'flat',
          };
          return audio;
        }
        if (message.op === 'write-preset') {
          audio = {
            volume: (audio && audio.volume) || 100,
            preset: message.preset,
          };
          return audio;
        }
        return null;
      },
      onMessage: { addListener() {} },
    },
    // Empty string makes the popup fall back to its inline English copy, which
    // is what we want to review.
    i18n: { getMessage: () => '' },
    storage: {
      local: {
        get: async (key) => ({ [key]: store[key] }),
        set: async (patch) => Object.assign(store, patch),
        onChanged: { addListener() {} },
      },
    },
    tabs: {
      query: async (q) => (q.audible ? TABS : [TABS[0]]),
      update: async () => TABS[0],
      create: async () => undefined,
    },
    windows: { update: async () => undefined },
  };
})();
