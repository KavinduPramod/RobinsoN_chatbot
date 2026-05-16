import React from 'react';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  onSettings: () => void;
  onClearChat: () => void;
}

export default function ChatHeader({ title, subtitle, onSettings, onClearChat }: ChatHeaderProps) {
  return (
    <header className="px-7 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
      <div>
        <div className="font-display text-sm font-semibold leading-tight">
          {title}
        </div>
        <div className="text-xs text-text3 mt-0.5">
          {subtitle}
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={onSettings}
          className="w-8 h-8 rounded-r-sm border border-border bg-transparent text-text3 cursor-pointer flex items-center justify-center hover:bg-surface2 hover:text-text2 hover:border-border2 transition-all"
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button
          onClick={onClearChat}
          className="w-8 h-8 rounded-r-sm border border-border bg-transparent text-text3 cursor-pointer flex items-center justify-center hover:bg-surface2 hover:text-text2 hover:border-border2 transition-all"
          title="Clear chat"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
