import React from 'react';
import { t } from '../../../shared/i18n';
import { StarIcon } from '../icons';

interface Props {
  onDismiss: () => void;
}

function storeReviewUrl(): string {
  return `https://chromewebstore.google.com/detail/${chrome.runtime.id}/reviews`;
}

export default function ReviewCard({ onDismiss }: Props) {
  const open = () => {
    void chrome.tabs.create({ url: storeReviewUrl() });
  };

  return (
    <div className="review">
      <div className="review__text">
        <strong>{t('review_title', 'Enjoying Volume Controller?')}</strong>
        <span>{t('review_body', 'A 5-star rating really helps.')}</span>
      </div>
      <div
        className="review__stars"
        role="group"
        aria-label={t('review_action', 'Rate this extension')}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="review__star"
            aria-label={t('review_star', 'Rate $1 out of 5', String(n))}
            onClick={open}
          >
            <StarIcon />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="review__close"
        aria-label={t('review_hide', 'Hide')}
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
