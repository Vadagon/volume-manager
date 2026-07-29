# Volume Controller & Booster

Chrome MV3 extension. Boost any tab up to 600 %, control every tab
independently, and shape the sound with a three-preset equaliser.

The store name is **Volume Controller & Booster**; the popup header shows the
shorter **Volume Controller**.

## Commands

```bash
npm install
npm run build     # production bundle in build/, zipped into zip/
npm start         # webpack dev server with hot reload
```

Load the unpacked extension from `build/`.

## Layout

```
src/
  shared/            contract shared by all three contexts
    protocol.ts        message envelopes, EQ presets, storage keys
    bus.ts             addressed sendMessage / onMessage helpers
    scale.ts           the non-linear volume ladder
    store.ts           promise wrapper over chrome.storage.local
    i18n.ts            t(key, englishFallback)
  pages/
    Background/      service worker - routes popup requests, owns tabCapture
      engine.ts        per-tab work queue + offscreen document lifecycle
      badge.ts         toolbar badge
    Offscreen/       the only context that owns Web Audio state
    Popup/           React UI
dev/                 chrome.* stub for reviewing the popup in a plain tab
dist/                static files copied verbatim into build/ (_locales, icons)
```

### How audio flows

`popup → service worker → offscreen document`

Everything funnels through the worker because only it can call
`chrome.tabCapture.getMediaStreamId`, and because a single per-tab queue there
is what stops two concurrent requests capturing the same tab twice.
The offscreen document holds the graph — `MediaStreamSource → GainNode →
BiquadFilter → destination` — and survives the worker being evicted.

Every runtime message carries a `to` field: all three contexts receive every
message, so each listener ignores anything not addressed to it.

### Reading tab state

`stateOf()` returns the *requested* volume stored on the graph, never
`gain.gain.value`. `setTargetAtTime` ramps, so the AudioParam keeps reporting
the previous value after a write - reading it back left the toolbar badge stuck
on the old number after Reset.

### The volume ladder

The slider is an index into a non-linear ladder (1 % steps below 10 %, 10 %
steps above), not a plain 0–600 range — percent points are not perceptually
equal. Anything that positions a marker on the track must work in *ladder-index*
space, or it drifts away from the thumb.

## Previewing the popup without installing

```bash
npm run build
```

Then open `dev/popup-light.html` or `dev/popup-dark.html` in a browser. They
load the real `build/popup.bundle.js` against a stubbed `chrome.*`.

## Localisation

`dist/_locales/<locale>/messages.json` carries the extension name and
description in 54 locales. UI strings go through
`t('key', 'English fallback')`, so a key missing from a locale falls back to
English rather than rendering blank.
