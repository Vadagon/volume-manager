import React from 'react';
import { t } from '../../../shared/i18n';
import { focusTab } from '../api';

interface Props {
  tabs: chrome.tabs.Tab[];
  currentTabId?: number;
  currentVolume: number;
}

const BLANK_FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
      '<rect width="16" height="16" rx="3" fill="%23c9ccd8"/></svg>'
  );

export default function TabList({ tabs, currentTabId, currentVolume }: Props) {
  if (!tabs.length) {
    return (
      <>
        <div className="rule">{t('tabs_rule_idle', 'Playing audio')}</div>
        <p className="empty">{t('tabs_empty', 'No tab is playing audio.')}</p>
      </>
    );
  }

  return (
    <>
      <div className="rule">
        {t('tabs_rule', 'Playing audio · $1 tabs', String(tabs.length))}
      </div>
      {tabs.map((tab) => {
        const isCurrent = tab.id === currentTabId;
        return (
          <button
            key={tab.id}
            type="button"
            className={`tab${isCurrent ? ' is-current' : ''}`}
            onClick={() => focusTab(tab)}
            title={tab.title}
          >
            <img
              className="tab__icon"
              src={tab.favIconUrl || BLANK_FAVICON}
              alt=""
              onError={(event) => {
                event.currentTarget.src = BLANK_FAVICON;
              }}
            />
            <span className="tab__title">{tab.title || tab.url}</span>
            {isCurrent && (
              <span className="eqbars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            )}
            {isCurrent && (
              <span className="tab__level">{currentVolume} %</span>
            )}
          </button>
        );
      })}
    </>
  );
}
