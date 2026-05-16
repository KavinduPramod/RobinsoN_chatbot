import React, { useState } from 'react';

interface SidebarProps {
  chatHistory: any[];
  currentChatId: string | null;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  userEmail: string;
}

export default function Sidebar({ chatHistory, currentChatId, onNewChat, onLoadChat, onDeleteChat, userEmail }: SidebarProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-display font-bold text-sm text-white">
            R
          </div>
          <div>
            <div className="font-display text-xl font-bold leading-tight">Robin</div>
            <div className="text-xs text-text3 uppercase tracking-wider">AI Assistant</div>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="w-full px-3.5 py-2 bg-accent-dim border border-accent/25 rounded-r-sm text-accent2 font-body text-xs font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-accent/20 hover:border-accent/40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New conversation
        </button>
      </div>

      <div className="text-xs text-text3 uppercase tracking-widest font-medium px-5 py-4">Recent</div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {chatHistory.length === 0 ? (
          <div className="px-2.5 py-2 text-xs text-text3">No conversations yet</div>
        ) : (
          chatHistory.map(chat => (
            <div
              key={chat.id}
              className={`px-2.5 py-2 rounded-r-sm cursor-pointer flex items-center gap-2 transition-all border border-transparent mb-0.5 group ${
                chat.id === currentChatId
                  ? 'bg-surface2 border-border'
                  : 'hover:bg-surface2'
              }`}
              onMouseEnter={() => setHoverId(chat.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onLoadChat(chat.id)}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-text3"/>
              <div className="text-xs text-text2 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {chat.title}
              </div>
              {hoverId === chat.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-surface3 rounded transition-colors"
                  title="Delete conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text3 hover:text-red-400">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3.5 border-t border-border">
        <div className="flex items-center gap-2 px-2.5 py-2 bg-surface2 rounded-r-sm border border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0 shadow-lg" style={{boxShadow: '0 0 6px #22c55e'}}/>
          <div className="text-xs text-text2 overflow-hidden text-ellipsis whitespace-nowrap">
            {userEmail ? userEmail.split('@')[0] : 'Robin'}
          </div>
        </div>
      </div>
    </aside>
  );
}
