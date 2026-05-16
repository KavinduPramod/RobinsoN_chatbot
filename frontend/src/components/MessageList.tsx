import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const markdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-xl font-bold mt-3 mb-2 text-text" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-lg font-bold mt-3 mb-2 text-text" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-base font-bold mt-2 mb-1 text-text" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-2 leading-relaxed" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
  ol: ({ node, ordered, ...props }: any) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
  li: ({ node, ...props }: any) => <li className="ml-1" {...props} />,
  code: ({ node, inline, ...props }: any) => 
    inline ? (
      <code className="bg-surface3 px-1.5 py-0.5 rounded text-accent2 font-mono text-xs" {...props} />
    ) : (
      <code className="text-inherit" {...props} />
    ),
  pre: ({ node, ...props }: any) => (
    <pre className="bg-surface3 border border-border rounded-lg p-3 mb-2 overflow-x-auto" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-accent pl-3 italic opacity-80 my-2" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-accent2 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <table className="border-collapse border border-border my-2" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="border border-border px-2 py-1 bg-surface2 font-semibold" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="border border-border px-2 py-1" {...props} />
  ),
  hr: ({ node, ...props }: any) => <hr className="my-3 border-border" {...props} />,
};

export default React.forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList({ messages, isLoading }, ref) {
    return (
      <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 py-7">
        {messages.map((message) => (
          <div key={message.id} className="mb-6 message-enter">
            <div className={`flex items-center gap-2.5 mb-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`w-7 h-7 rounded-2xl flex items-center justify-center font-display font-bold text-xs flex-shrink-0 ${
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-accent to-purple-500 text-white'
                  : 'bg-surface3 text-text2'
              }`}>
                {message.role === 'assistant' ? 'R' : 'U'}
              </div>
              <span className="text-xs font-medium text-text2">
                {message.role === 'assistant' ? 'Robin' : 'You'}
              </span>
              <span className="text-xs text-text3">
                {message.timestamp}
              </span>
            </div>
            <div className={`px-4 py-3.5 rounded-2xl text-sm leading-7 ${
              message.role === 'assistant'
                ? 'bg-robin-msg border border-border'
                : 'bg-user-msg border border-accent/20 ml-auto w-fit max-w-xs md:max-w-md lg:max-w-lg'
            }`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
                className="space-y-2"
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-7 h-7 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0">
              R
            </div>
            <div className="flex gap-1 px-4 py-3 bg-robin-msg border border-border rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-text3 typing-dot"/>
              <div className="w-1.5 h-1.5 rounded-full bg-text3 typing-dot"/>
              <div className="w-1.5 h-1.5 rounded-full bg-text3 typing-dot"/>
            </div>
          </div>
        )}

        <div ref={ref} />
      </div>
    );
  }
);
