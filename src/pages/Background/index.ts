import { listen } from '../../shared/bus';
import {
  Ctx,
  DEFAULT_PRESET,
  DomainMemory,
  Envelope,
  Keys,
  Op,
  VOLUME_NEUTRAL,
} from '../../shared/protocol';
import { hostnameOf, read } from '../../shared/store';
import {
  ensureEngine,
  readTab,
  releaseTab,
  setPreset,
  setVolume,
} from './engine';

/* ----------------------------------------------------------------- router */

/**
 * Every popup request funnels through the worker rather than reaching the
 * offscreen document directly, so all capture decisions pass through a single
 * per-tab queue (see engine.ts). A popup with its own queue would reintroduce
 * the double-capture race the moment both contexts were active.
 */
listen(Ctx.worker, async (message: Envelope) => {
  const { op, tabId } = message;
  if (op === Op.readTab) return readTab(tabId);
  if (op === Op.writeVolume)
    return setVolume(tabId, message.volume ?? VOLUME_NEUTRAL);
  if (op === Op.writePreset)
    return setPreset(tabId, message.preset ?? DEFAULT_PRESET);
  return null;
});

/* ------------------------------------------------------------- lifecycle -- */

// Warm the engine on wake-up so the first slider drag is not stuck behind an
// offscreen-document creation.
ensureEngine().catch((error) => console.error('[worker] engine boot', error));

chrome.runtime.onStartup.addListener(() => {
  ensureEngine().catch(() => undefined);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void releaseTab(tabId);
});

/**
 * A navigation swaps the document but keeps the tab id, and the capture follows
 * the tab - so the graph stays valid and the previous site's boost would leak
 * into the new one. Re-apply whatever the new hostname is remembered at.
 */
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status !== 'complete') return;
  const host = hostnameOf(tab.url);
  if (!host) return;

  void (async () => {
    const live = await readTab(tabId);
    if (!live) return; // never captured - nothing of ours is affecting it

    const memory = await read<DomainMemory>(Keys.perDomain, {});
    const remembered = memory[host]?.volume ?? VOLUME_NEUTRAL;
    if (remembered !== live.volume) await setVolume(tabId, remembered);
  })();
});
