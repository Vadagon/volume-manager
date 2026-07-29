import { listen } from '../../shared/bus';
import {
  Ctx,
  DEFAULT_PRESET,
  Envelope,
  Op,
  PRESETS,
  PresetId,
  TabAudioState,
  VOLUME_NEUTRAL,
} from '../../shared/protocol';

/**
 * The offscreen document is the only place in the extension that owns Web Audio
 * state. The service worker can be evicted at any moment; this document stays
 * alive as long as at least one tab is captured, so the graphs survive with it.
 *
 * Graph per tab:  MediaStreamSource -> GainNode -> BiquadFilter -> destination
 */

interface Graph {
  ctx: AudioContext;
  stream: MediaStream;
  gain: GainNode;
  filter: BiquadFilterNode;
  preset: PresetId;
  /**
   * The requested volume, tracked separately from `gain.gain.value`.
   *
   * `setTargetAtTime` ramps exponentially, so for a few tens of milliseconds
   * after a write the AudioParam still reads close to the *previous* value.
   * Reading it back would report stale state to the popup and the badge - e.g.
   * pressing Reset would answer "240" and leave the badge showing 240.
   */
  volume: number;
}

const graphs = new Map<number, Graph>();

/** Ramp constant, in seconds. Long enough to avoid a click, short enough to
 *  feel instant while dragging the slider. */
const RAMP = 0.02;

async function openCapture(streamId: string): Promise<MediaStream> {
  // The `mandatory` shape is the only one chromeMediaSource accepts; the modern
  // constraint syntax is silently ignored here.
  return navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
  } as unknown as MediaStreamConstraints);
}

function buildGraph(stream: MediaStream, volume: number): Graph {
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  applyPreset(filter, DEFAULT_PRESET);
  gain.gain.value = volume / 100;

  source.connect(gain);
  gain.connect(filter);
  filter.connect(ctx.destination);

  return { ctx, stream, gain, filter, preset: DEFAULT_PRESET, volume };
}

function applyPreset(filter: BiquadFilterNode, preset: PresetId): void {
  const shape = PRESETS[preset];
  filter.type = shape.type;
  filter.frequency.value = shape.frequency;
  filter.Q.value = shape.q;
  filter.gain.value = shape.gain;
}

/**
 * Resolves the graph for a tab, creating it from `streamId` when the tab has
 * not been captured yet. Returns null when there is nothing to work with -
 * e.g. the worker had no stream id to hand over.
 */
async function graphFor(
  tabId: number,
  streamId?: string
): Promise<Graph | null> {
  const existing = graphs.get(tabId);
  if (existing) return existing;
  if (!streamId) return null;

  const stream = await openCapture(streamId);

  // A second request may have landed while getUserMedia was in flight. Keep the
  // winner and throw the duplicate capture away, or the tab plays twice.
  const raced = graphs.get(tabId);
  if (raced) {
    stream.getTracks().forEach((track) => track.stop());
    return raced;
  }

  const graph = buildGraph(stream, VOLUME_NEUTRAL);
  graphs.set(tabId, graph);

  // The user can also end the capture from Chrome's own "stop sharing" affordance.
  stream.getAudioTracks().forEach((track) => {
    track.addEventListener('ended', () => void dropTab(tabId));
  });

  return graph;
}

async function dropTab(tabId: number): Promise<void> {
  const graph = graphs.get(tabId);
  if (!graph) return;
  graphs.delete(tabId);
  graph.stream.getTracks().forEach((track) => track.stop());
  try {
    await graph.ctx.close();
  } catch {
    /* already closed */
  }
}

function stateOf(tabId: number): TabAudioState | null {
  const graph = graphs.get(tabId);
  if (!graph) return null;
  return { volume: graph.volume, preset: graph.preset };
}

listen(Ctx.offscreen, async (message: Envelope) => {
  const { op, tabId } = message;

  if (op === Op.readTab) {
    return stateOf(tabId);
  }

  if (op === Op.writeVolume) {
    const graph = await graphFor(tabId, message.streamId);
    if (!graph) return null;
    const volume = message.volume ?? VOLUME_NEUTRAL;
    graph.volume = volume;
    graph.gain.gain.setTargetAtTime(volume / 100, graph.ctx.currentTime, RAMP);
    return stateOf(tabId);
  }

  if (op === Op.writePreset) {
    const graph = await graphFor(tabId, message.streamId);
    if (!graph) return null;
    graph.preset = message.preset ?? DEFAULT_PRESET;
    applyPreset(graph.filter, graph.preset);
    return stateOf(tabId);
  }

  if (op === Op.dropTab) {
    await dropTab(tabId);
    return null;
  }

  return null;
});
