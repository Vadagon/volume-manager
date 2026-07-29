import React from 'react';
import { PresetId } from '../../../shared/protocol';
import { t } from '../../../shared/i18n';
import { BassIcon, FlatIcon, VoiceIcon } from '../icons';

interface Props {
  value: PresetId;
  onChange: (preset: PresetId) => void;
}

const SEGMENTS: Array<{
  id: PresetId;
  key: string;
  label: string;
  hint: string;
  Icon: (p: { className?: string }) => JSX.Element;
}> = [
  {
    id: 'flat',
    key: 'preset_flat',
    label: 'Flat',
    hint: 'No equalisation',
    Icon: FlatIcon,
  },
  {
    id: 'voice',
    key: 'preset_voice',
    label: 'Voice',
    hint: 'Lift speech out of the mix',
    Icon: VoiceIcon,
  },
  {
    id: 'bass',
    key: 'preset_bass',
    label: 'Bass',
    hint: 'Warmer low end',
    Icon: BassIcon,
  },
];

export default function PresetSegments({ value, onChange }: Props) {
  return (
    <div className="segments" role="group" aria-label={t('eq_label', 'Sound')}>
      {SEGMENTS.map(({ id, key, label, hint, Icon }) => (
        <button
          key={id}
          type="button"
          className={id === value ? 'is-on' : undefined}
          aria-pressed={id === value}
          title={t(`${key}_hint`, hint)}
          onClick={() => onChange(id)}
        >
          <Icon />
          {t(key, label)}
        </button>
      ))}
    </div>
  );
}
