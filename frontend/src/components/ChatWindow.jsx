/**
 * components/ChatWindow.jsx — The scrollable area showing all messages.
 *
 * Props (all come from useChat):
 *   messages      — completed message history
 *   streamingText — current in-progress AI reply (empty string if not streaming)
 *   isStreaming   — true while AI is generating
 *   error         — error string or null
 *
 * SPEED TRICK:
 *   We only pass `streamingText` to ONE component (the streaming bubble).
 *   All the other `MessageBubble` components receive fixed props and
 *   React never re-renders them during streaming — only the streaming bubble updates.
 */

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  // The scrollable container — fills all available vertical space
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Centered content column (like ChatGPT's layout)
  inner: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Empty state shown before first message
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flex: 1,
    minHeight: '300px',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '4px',
  },

  emptyTitle: {
    fontSize: '20px',
    fontWeight: '500',
    color: 'var(--text-dim)',
  },

  emptyHint: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    maxWidth: '280px',
  },

  // Error banner
  errorBanner: {
    background: 'var(--danger-dim)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--danger)',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Three animated dots shown while waiting for first token
  thinkingDots: {
    display: 'flex',
    gap: '5px',
    padding: '8px 0',
  },

  dot: (delay) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--text-muted)',
    animation: `pulse 1.2s ease ${delay} infinite`,
  }),
}

export default function ChatWindow({ messages, streamingText, isStreaming, error }) {
  // Ref attached to a hidden div at the bottom — we scroll to it on new content
  const bottomRef = useRef(null)

  // Auto-scroll every time a message is added or streaming text updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Is the AI "thinking" (waiting for the first word) vs actively streaming?
  const isThinking = isStreaming && !streamingText

  return (
    <div style={styles.container}>
      <div style={styles.inner}>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {messages.length === 0 && !isStreaming && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✦</div>
            <div style={styles.emptyTitle}>What can I help with?</div>
            <div style={styles.emptyHint}>
              Send a message, or attach an image or PDF to get started.
            </div>
          </div>
        )}

        {/* ── Message history ─────────────────────────────────────────────── */}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            files={msg.files}
            error={msg.error || false}
          />
        ))}

        {/* ── Currently streaming reply ───────────────────────────────────── */}
        {isThinking && (
          // Show pulsing dots while waiting for the first word
          <div style={styles.thinkingDots} aria-label="AI is thinking">
            <div style={styles.dot('0s')} />
            <div style={styles.dot('0.2s')} />
            <div style={styles.dot('0.4s')} />
          </div>
        )}

        {streamingText && (
          // Show the streaming bubble with a blinking cursor
          <MessageBubble
            role="assistant"
            content={streamingText}
            streaming={true}
          />
        )}

        {/* ── Error message ─────────────────────────────────────────────────── */}
        {error && (
          <MessageBubble
            role="assistant"
            content={error}
            error={true}
          />
        )}

        {/* Invisible anchor — we scroll to this on new content */}
        <div ref={bottomRef} />

      </div>
    </div>
  )
}