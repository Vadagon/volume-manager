import { VOLUME_NEUTRAL } from '../../shared/protocol';

const ACCENT = '#6d5efc';
const BOOST = '#ff8f3c';

/**
 * The badge is a status light, not a readout: at 100 % there is nothing to say,
 * so it clears instead of permanently branding the toolbar icon with "100".
 */
export function paintBadge(tabId: number, volume: number): void {
  const text = volume === VOLUME_NEUTRAL ? '' : String(Math.round(volume));
  chrome.action.setBadgeText({ tabId, text }).catch(() => undefined);
  if (!text) return;
  chrome.action
    .setBadgeBackgroundColor({
      tabId,
      color: volume > VOLUME_NEUTRAL ? BOOST : ACCENT,
    })
    .catch(() => undefined);
}
