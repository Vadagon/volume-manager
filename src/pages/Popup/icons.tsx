import React from 'react';

/** Inline so the popup never waits on a network/file fetch to paint. */

type P = { className?: string };

export const MoonIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export const SunIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 5a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 8h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2ZM3 12H2a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm15.7 7.1-.7-.7a1 1 0 0 1 1.4-1.4l.7.7a1 1 0 0 1-1.4 1.4ZM4.9 6.3l-.7-.7a1 1 0 0 1 1.4-1.4l.7.7A1 1 0 0 1 4.9 6.3Zm14.2 0a1 1 0 0 1-.7-1.7l.7-.7a1 1 0 1 1 1.4 1.4l-.7.7a1 1 0 0 1-.7.3ZM4.9 19.4a1 1 0 0 1-.7-1.7l.7-.7a1 1 0 1 1 1.4 1.4l-.7.7a1 1 0 0 1-.7.3Z" />
  </svg>
);

export const FlatIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M2 11h20v2H2z" />
  </svg>
);

export const VoiceIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
  </svg>
);

export const BassIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M3 13h2v-2H3v2Zm4 4h2V7H7v10Zm4 3h2V4h-2v16Zm4-3h2V7h-2v10Zm4-4h2v-2h-2v2Z" />
  </svg>
);

export const HistoryIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M13 3a9 9 0 1 0 8.5 12h-2.2A7 7 0 1 1 13 5a6.9 6.9 0 0 1 4.9 2.1L15 10h7V3l-2.6 2.6A8.9 8.9 0 0 0 13 3Zm-1 4v6l5 3 .8-1.3-4.3-2.5V7H12Z" />
  </svg>
);

export const StarIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
  </svg>
);
