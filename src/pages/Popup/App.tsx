import React from 'react';
import {
  DEFAULT_PRESET,
  DomainMemory,
  Keys,
  PresetId,
  VOLUME_NEUTRAL,
} from '../../shared/protocol';
import { buildLadder, rungIndex } from '../../shared/scale';
import { hostnameOf, read, write } from '../../shared/store';
import { t } from '../../shared/i18n';
import { activeTab, audibleTabs, readTab, writePreset, writeVolume } from './api';
import { MoonIcon, SunIcon, HistoryIcon } from './icons';
import VolumeSlider from './components/VolumeSlider';
import PresetSegments from './components/PresetSegments';
import TabList from './components/TabList';
import ReviewCard from './components/ReviewCard';

const ladder = buildLadder();
const NEUTRAL_INDEX = rungIndex(ladder, VOLUME_NEUTRAL);

/** tabCapture only works on ordinary web pages. */
function isControllable(url?: string): boolean {
  return !!url && /^https?:/i.test(url);
}

export default function App() {
  const [tab, setTab] = React.useState<chrome.tabs.Tab | null>(null);
  const [index, setIndex] = React.useState(NEUTRAL_INDEX);
  const [preset, setPreset] = React.useState<PresetId>(DEFAULT_PRESET);
  const [tabs, setTabs] = React.useState<chrome.tabs.Tab[]>([]);
  const [remembered, setRemembered] = React.useState<number | null>(null);
  const [dark, setDark] = React.useState(false);
  const [reviewHidden, setReviewHidden] = React.useState(true);

  const volume = ladder[index] ?? VOLUME_NEUTRAL;
  const host = hostnameOf(tab?.url);
  const controllable = isControllable(tab?.url);

  /* ------------------------------------------------------------- bootstrap */

  React.useEffect(() => {
    let alive = true;

    void (async () => {
      const [current, theme, hidden] = await Promise.all([
        activeTab(),
        read<'dark' | 'light' | null>(Keys.theme, null),
        read<boolean>(Keys.reviewHidden, false),
      ]);
      if (!alive) return;

      setTab(current);
      setReviewHidden(hidden);
      void audibleTabs(current?.id).then((list) => {
        if (alive) setTabs(list);
      });

      const prefersDark =
        theme === null
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : theme === 'dark';
      setDark(prefersDark);

      if (!current?.id) return;

      const live = await readTab(current.id);
      if (!alive) return;

      if (live) {
        setIndex(rungIndex(ladder, live.volume));
        setPreset(live.preset);
      } else {
        // Not captured yet. If this domain was boosted before, offer to bring
        // that back rather than silently re-applying it - re-capturing a tab
        // the user did not ask about is surprising.
        //
        // Read the hostname off `current` rather than the `host` binding: the
        // latter derives from `tab` state this effect has only just queued, so
        // inside this closure it is still null.
        const currentHost = hostnameOf(current.url);
        const memory = await read<DomainMemory>(Keys.perDomain, {});
        const saved = currentHost ? memory[currentHost]?.volume : undefined;
        if (alive && saved != null && saved !== VOLUME_NEUTRAL) {
          setRemembered(saved);
        }
      }
    })();

    return () => {
      alive = false;
    };
    // `host` is derived from `tab`, which this effect is what sets - running
    // once on mount is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    const id = window.setTimeout(() => document.body.classList.add('ready'), 60);
    return () => window.clearTimeout(id);
  }, [dark]);

  /* ----------------------------------------------------------- persistence */

  const remember = React.useCallback(
    async (nextVolume: number, nextPreset: PresetId) => {
      if (!host) return;
      const memory = await read<DomainMemory>(Keys.perDomain, {});
      if (nextVolume === VOLUME_NEUTRAL && nextPreset === DEFAULT_PRESET) {
        delete memory[host];
      } else {
        memory[host] = { volume: nextVolume, preset: nextPreset };
      }
      await write(Keys.perDomain, memory);
    },
    [host]
  );

  /* ------------------------------------------------------- volume writing */

  // Dragging the slider fires far faster than a message round-trip. Keep one
  // request in flight and always follow it with the most recent value, so the
  // engine never lags behind the thumb but the queue never grows either.
  const inFlight = React.useRef(false);
  const trailing = React.useRef<number | null>(null);

  const pushVolume = React.useCallback(
    async (nextVolume: number) => {
      const tabId = tab?.id;
      if (tabId == null) return;

      if (inFlight.current) {
        trailing.current = nextVolume;
        return;
      }
      inFlight.current = true;
      try {
        await writeVolume(tabId, nextVolume);
      } finally {
        inFlight.current = false;
      }
      const queued = trailing.current;
      trailing.current = null;
      if (queued != null && queued !== nextVolume) await pushVolume(queued);
    },
    [tab?.id]
  );

  const applyIndex = React.useCallback(
    (nextIndex: number) => {
      const clamped = Math.min(Math.max(nextIndex, 0), ladder.length - 1);
      setIndex(clamped);
      setRemembered(null);
      const nextVolume = ladder[clamped];
      void pushVolume(nextVolume);
      void remember(nextVolume, preset);
    },
    [pushVolume, remember, preset]
  );

  const applyVolume = React.useCallback(
    (nextVolume: number) => applyIndex(rungIndex(ladder, nextVolume)),
    [applyIndex]
  );

  const applyPreset = React.useCallback(
    (next: PresetId) => {
      setPreset(next);
      if (tab?.id != null) void writePreset(tab.id, next);
      void remember(volume, next);
    },
    [tab?.id, remember, volume]
  );

  /* ------------------------------------------------------------------ view */

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    void write(Keys.theme, next ? 'dark' : 'light');
  };

  const hideReview = () => {
    setReviewHidden(true);
    void write(Keys.reviewHidden, true);
  };

  return (
    <div className="shell">
      <header className="head">
        <img
          className="head__mark"
          src="assets/icons/volume-up211.png"
          alt=""
        />
        <div className="head__text">
          <h1>{t('ui_app_name', 'Volume Controller')}</h1>
          <p>{t('ui_tagline', 'Boost and balance any tab')}</p>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={t('theme_toggle', 'Switch theme')}
          onClick={toggleTheme}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {controllable ? (
        <>
          <div
            className={
              'readout' +
              (volume > VOLUME_NEUTRAL ? ' is-boosted' : '') +
              (volume === 0 ? ' is-silent' : '')
            }
          >
            <span className="readout__value">{volume}</span>
            <span className="readout__unit">%</span>
            {volume !== VOLUME_NEUTRAL && (
              <button
                type="button"
                className="readout__reset"
                onClick={() => applyIndex(NEUTRAL_INDEX)}
              >
                {t('reset', 'Reset')}
              </button>
            )}
          </div>

          <VolumeSlider ladder={ladder} index={index} onIndex={applyIndex} />

          <PresetSegments value={preset} onChange={applyPreset} />

          {remembered != null && host && (
            <button
              type="button"
              className="restore"
              aria-label={t(
                'restore_aria',
                'Restore $1 % volume for $2',
                String(remembered),
                host
              )}
              onClick={() => applyVolume(remembered)}
            >
              <HistoryIcon />
              <span>
                {t('restore', 'Restore')} <b>{remembered} %</b>{' '}
                {t('restore_for', 'for')} <b>{host}</b>
              </span>
            </button>
          )}
        </>
      ) : (
        <p className="notice">
          {t(
            'not_controllable',
            'Chrome does not allow audio capture on this page. Open a normal website and try again.'
          )}
        </p>
      )}

      <TabList
        tabs={tabs}
        currentTabId={tab?.id}
        currentVolume={volume}
      />

      {!reviewHidden && <ReviewCard onDismiss={hideReview} />}

    </div>
  );
}
