/**
 * Wire protocol shared by the popup, the service worker and the offscreen
 * document. Every context receives *every* runtime message, so each envelope
 * carries an explicit `to` field and listeners bail out on anything that is not
 * addressed to them. Without that, two listeners race to answer the same
 * message and one of them wins by accident.
 */

export const Ctx = {
  worker: 'vc:worker',
  offscreen: 'vc:offscreen',
} as const;

export type Ctx = (typeof Ctx)[keyof typeof Ctx];

export const Op = {
  /** popup -> worker: read the live state of a tab (volume, preset, capture) */
  readTab: 'read-tab',
  /** popup -> worker: set the gain of a tab, capturing it first if needed */
  writeVolume: 'write-volume',
  /** popup -> worker: switch the equaliser preset of a tab */
  writePreset: 'write-preset',
  /** worker -> offscreen: tear the audio graph of a closed tab down */
  dropTab: 'drop-tab',
} as const;

export type Op = (typeof Op)[keyof typeof Op];

export interface Envelope {
  to: Ctx;
  op: Op;
  tabId: number;
  /** Present only when the offscreen document still has to open the capture. */
  streamId?: string;
  volume?: number;
  preset?: PresetId;
}

/** What the offscreen document knows about one tab. `null` = never captured. */
export interface TabAudioState {
  volume: number;
  preset: PresetId;
}

/* ------------------------------------------------------------------ audio */

export type PresetId = 'flat' | 'voice' | 'bass';

export interface FilterShape {
  type: BiquadFilterType;
  frequency: number;
  q: number;
  gain: number;
}

/**
 * One biquad sits behind the gain stage. `flat` keeps the node in the graph but
 * at 0 dB, which is mathematically transparent, so switching presets never has
 * to rewire anything.
 */
export const PRESETS: Record<PresetId, FilterShape> = {
  flat: { type: 'peaking', frequency: 1000, q: 1, gain: 0 },
  voice: { type: 'peaking', frequency: 1800, q: 0.9, gain: 10 },
  bass: { type: 'lowshelf', frequency: 320, q: 1, gain: 7 },
};

export const DEFAULT_PRESET: PresetId = 'flat';

/* ----------------------------------------------------------------- volume */

export const VOLUME_NEUTRAL = 100;
export const VOLUME_CEILING = 600;

/* ---------------------------------------------------------------- storage */

export const Keys = {
  theme: 'vc.theme',
  perDomain: 'vc.per-domain',
  reviewHidden: 'vc.review-hidden',
} as const;

export interface DomainMemory {
  [hostname: string]: { volume: number; preset: PresetId };
}
