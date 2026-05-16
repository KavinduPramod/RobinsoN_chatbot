import React, { useState } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const [rows, setRows] = useState(1);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const element = e.target;
    element.style.height = 'auto';
    const newHeight = Math.min(element.scrollHeight, 160);
    element.style.height = newHeight + 'px';
    setRows(Math.min(Math.ceil(newHeight / 24), 6));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
      setRows(1);
    }
  };

  const charCount = inputValue.length;

  return (
    <div className="px-4 md:px-6 py-5 border-t border-border flex-shrink-0">
      <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="bg-surface border border-border2 rounded-2xl px-4 py-3 flex items-end gap-2.5 focus-within:border-accent/40 focus-within:shadow-lg transition-all">
          <textarea
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent outline-none text-sm leading-6 resize-none font-body text-text placeholder-text3 max-h-40 scrollbar-thin"
            rows={rows}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`w-8 h-8 rounded-xl border-none cursor-pointer flex items-center justify-center flex-shrink-0 transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-accent opacity-100 shadow-lg hover:bg-purple-600 active:scale-95'
                : 'bg-accent opacity-50 cursor-not-allowed'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-text3">
            Press <kbd className="bg-surface3 border border-border rounded px-1.5 py-0.5 text-xs text-text3">Shift + Enter</kbd> for new line
          </span>
          <span className="text-xs text-text3">{charCount} char{charCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
