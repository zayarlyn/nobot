import React from 'react';

export function timeAgo(dateStr: string): string {
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function highlightKeyword(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? React.createElement('mark', { key: i, className: 'bg-yellow-300 text-black font-bold' }, `🚨 ${part}`)
      : part
  );
}

export function isDeadThread(lastActivityAt: string): boolean {
  return Date.now() - new Date(lastActivityAt).getTime() > 86_400_000;
}
