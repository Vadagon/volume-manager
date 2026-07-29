import { ask } from '../../shared/bus';
import {
  Ctx,
  Op,
  PresetId,
  TabAudioState,
  VOLUME_NEUTRAL,
} from '../../shared/protocol';

/** Thin popup-side façade over the worker. */

export function readTab(tabId: number): Promise<TabAudioState | null> {
  return ask<TabAudioState | null>({ to: Ctx.worker, op: Op.readTab, tabId });
}

export function writeVolume(
  tabId: number,
  volume: number
): Promise<TabAudioState | null> {
  return ask<TabAudioState | null>({
    to: Ctx.worker,
    op: Op.writeVolume,
    tabId,
    volume,
  });
}

export function writePreset(
  tabId: number,
  preset: PresetId
): Promise<TabAudioState | null> {
  return ask<TabAudioState | null>({
    to: Ctx.worker,
    op: Op.writePreset,
    tabId,
    preset,
  });
}

export async function activeTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

/**
 * The tab being controlled leads the list - it is the one the slider above
 * refers to, so burying it among the others makes the popup read wrong.
 * Everything else falls back to most-recently-opened first.
 */
export async function audibleTabs(
  currentTabId?: number
): Promise<chrome.tabs.Tab[]> {
  const tabs = await chrome.tabs.query({ audible: true });
  return tabs.sort((a, b) => {
    if (a.id === currentTabId) return -1;
    if (b.id === currentTabId) return 1;
    return (b.id ?? 0) - (a.id ?? 0);
  });
}

export function focusTab(tab: chrome.tabs.Tab): void {
  if (tab.id == null) return;
  void chrome.tabs.update(tab.id, { active: true }).then((updated) => {
    if (updated?.windowId != null) {
      void chrome.windows.update(updated.windowId, { focused: true });
    }
  });
}

export const NEUTRAL = VOLUME_NEUTRAL;
