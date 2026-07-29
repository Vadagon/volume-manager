import React from 'react';
import { VOLUME_CEILING, VOLUME_NEUTRAL } from '../../../shared/protocol';
import { rungIndex } from '../../../shared/scale';
import { t } from '../../../shared/i18n';

interface Props {
  ladder: number[];
  index: number;
  onIndex: (index: number) => void;
}

/** Half the thumb width from popup.scss - the thumb centre never reaches the
 *  very edge of the track, so every marker has to be inset by the same amount
 *  or it drifts away from the thumb at the extremes. */
const THUMB_INSET = '5px';

/** Position of a normalised 0..1 fraction along the track. */
function along(fraction: number): string {
  return `calc(${THUMB_INSET} + ${fraction} * (100% - ${THUMB_INSET} * 2))`;
}

/**
 * The track is painted as a gradient rather than a second filled element: one
 * paint, no sub-pixel seam, and the boost zone can change colour mid-track
 * without extra DOM.
 *
 * Stops are placed in *ladder-index* space, not percent-of-600 space. The
 * ladder is deliberately non-linear (fine below 10 %, coarse above), so the two
 * do not agree - mixing them leaves the fill trailing behind the thumb.
 */
function trackFor(filled: number, unity: number, boosted: boolean): string {
  if (!boosted) {
    return (
      `linear-gradient(90deg, var(--accent) 0 ${along(filled)},` +
      ` var(--surface-hi) ${along(filled)})`
    );
  }
  return (
    `linear-gradient(90deg, var(--accent) 0 ${along(unity)},` +
    ` var(--boost) ${along(unity)} ${along(filled)},` +
    ` var(--surface-hi) ${along(filled)})`
  );
}

export default function VolumeSlider({ ladder, index, onIndex }: Props) {
  const volume = ladder[index] ?? VOLUME_NEUTRAL;
  const lastIndex = ladder.length - 1;
  const filled = lastIndex > 0 ? index / lastIndex : 0;
  const unity =
    lastIndex > 0 ? rungIndex(ladder, VOLUME_NEUTRAL) / lastIndex : 0;
  const boosted = volume > VOLUME_NEUTRAL;

  // One step per wheel event rather than per delta unit: a trackpad flick emits
  // a burst of small deltas, and honouring each would slam the slider to an end.
  const onWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    const next = Math.min(Math.max(index + direction, 0), lastIndex);
    if (next !== index) onIndex(next);
  };

  return (
    <div className="slider">
      <input
        type="range"
        min={0}
        max={lastIndex}
        step={1}
        value={index}
        autoFocus
        aria-label={t('slider_label', 'Tab volume')}
        aria-valuetext={`${volume} %`}
        style={
          {
            '--track': trackFor(filled, unity, boosted),
            '--thumb': boosted ? 'var(--boost)' : 'var(--accent)',
          } as React.CSSProperties
        }
        onChange={(event) => onIndex(Number(event.target.value))}
        onWheel={onWheel}
      />
      <span className="slider__unity" style={{ left: along(unity) }} />
      <div className="scale">
        <span>0</span>
        <b>{t('scale_neutral', '100 · normal')}</b>
        <span>{VOLUME_CEILING}</span>
      </div>
    </div>
  );
}
