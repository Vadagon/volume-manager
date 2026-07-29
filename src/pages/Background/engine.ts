import { ask } from '../../shared/bus';
import {
  Ctx,
  DEFAULT_PRESET,
  Op,
  PresetId,
  TabAudioState,
  VOLUME_NEUTRAL,
} from '../../shared/protocol';
import { paintBadge } from './badge';

const OFFSCREEN_PAGE = 'offscreen.html';

/* -------------------------------------------------- offscreen lifecycle -- */

let opening: Promise<void> | null = null;

async function alreadyOpen(): Promise<boolean> {
  const url = chrome.runtime.getURL(OFFSCREEN_PAGE);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [url],
  });
  return contexts.length > 0;
}

/**
 * Chrome allows exactly one offscreen document and throws if a second create
 * lands while the first is still resolving, so concurrent callers share one
 * in-flight promise.
 */
export function ensureEngine(): Promise<void> {
  if (opening) return opening;

  opening = (async () => {
    if (await alreadyOpen()) return;
    try {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_PAGE,
        reasons: [chrome.offscreen.Reason.USER_MEDIA],
        justification:
          'Hold the captured audio stream of each tab so its volume can be adjusted.',
      });
    } catch (error) {
      // Benign when another wake-up beat us to it; anything else is real.
      if (!(await alreadyOpen())) throw error;
    }
  })().finally(() => {
    opening = null;
  });

  return opening;
}

/* ----------------------------------------------------------- per-tab queue */

const queues = new Map<number, Promise<unknown>>();

/**
 * Serialises work per tab. Two slider events arriving together would otherwise
 * both observe "not captured yet" and each request a stream id, capturing the
 * same tab twice and doubling its audio.
 */
function inOrder<T>(tabId: number, job: () => Promise<T>): Promise<T> {
  const tail = queues.get(tabId) ?? Promise.resolve();
  const next = tail.then(job, job);
  queues.set(
    tabId,
    next.catch(() => undefined)
  );
  return next;
}

/* --------------------------------------------------------------- capture -- */

/**
 * `getMediaStreamId` is still callback-only in the shipped typings, and the
 * failure path reports through `lastError` rather than throwing - reading it is
 * what stops Chrome logging "Unchecked runtime.lastError".
 *
 * No `consumerTabId`: the consumer is our own offscreen document, not a tab.
 */
function streamIdFor(tabId: number): Promise<string | undefined> {
  return new Promise((resolve) => {
    try {
      chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
        if (chrome.runtime.lastError) {
          // Chrome refuses to capture its own pages, the Web Store and PDFs.
          console.warn(
            '[worker] cannot capture tab',
            tabId,
            chrome.runtime.lastError.message
          );
          resolve(undefined);
          return;
        }
        resolve(streamId);
      });
    } catch (error) {
      console.warn('[worker] cannot capture tab', tabId, error);
      resolve(undefined);
    }
  });
}

async function stateOf(tabId: number): Promise<TabAudioState | null> {
  return ask<TabAudioState | null>({ to: Ctx.offscreen, op: Op.readTab, tabId });
}

/** Stream id only when the engine has no graph for this tab yet. */
async function idIfNeeded(tabId: number): Promise<string | undefined> {
  const live = await stateOf(tabId);
  return live ? undefined : streamIdFor(tabId);
}

/* ------------------------------------------------------------------ API -- */

export function readTab(tabId: number): Promise<TabAudioState | null> {
  return inOrder(tabId, async () => {
    await ensureEngine();
    return stateOf(tabId);
  });
}

export function setVolume(
  tabId: number,
  volume: number
): Promise<TabAudioState | null> {
  return inOrder(tabId, async () => {
    await ensureEngine();
    const streamId = await idIfNeeded(tabId);
    const state = await ask<TabAudioState | null>({
      to: Ctx.offscreen,
      op: Op.writeVolume,
      tabId,
      volume,
      streamId,
    });
    paintBadge(tabId, state?.volume ?? volume);
    return state;
  });
}

export function setPreset(
  tabId: number,
  preset: PresetId
): Promise<TabAudioState | null> {
  return inOrder(tabId, async () => {
    await ensureEngine();
    const streamId = await idIfNeeded(tabId);
    return ask<TabAudioState | null>({
      to: Ctx.offscreen,
      op: Op.writePreset,
      tabId,
      preset,
      streamId,
    });
  });
}

export function releaseTab(tabId: number): Promise<unknown> {
  queues.delete(tabId);
  return ask({ to: Ctx.offscreen, op: Op.dropTab, tabId });
}

export const NEUTRAL: TabAudioState = {
  volume: VOLUME_NEUTRAL,
  preset: DEFAULT_PRESET,
};
