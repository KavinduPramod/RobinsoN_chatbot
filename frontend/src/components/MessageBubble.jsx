/**
 * components/MessageBubble.jsx — Renders one message in the chat.
 *
 * Props:
 *   role      — "user" | "assistant"
 *   content   — the text to display (markdown for assistant, plain text for user)
 *   streaming — true if this is the current in-progress AI reply (shows cursor)
 *   error     — true if this is an error message (applies red styling)
 */

import MarkdownMessage from './MarkdownMessage.jsx'

const styles = {
  // Wrapper: full width row, direction changes for user vs assistant
  wrapper: (role) => ({
    display: 'flex',
    flexDirection: role === 'user' ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: '10px',
    animation: 'fadeUp 0.25s ease forwards',
    width: '100%',
  }),

  // The small avatar circle
  avatar: (role) => ({
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    background: role === 'user' ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
    border: role === 'user' ? '1px solid rgba(34,211,238,0.25)' : '1px solid rgba(255,255,255,0.08)',
    color: role === 'user' ? '#22d3ee' : '#7b7fa0',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  }),

  // The message bubble / text block
  bubble: (role, error) => ({
    maxWidth: '72%',
    padding: role === 'user' ? '11px 16px' : '12px 14px',
    borderRadius: role === 'user' ? '18px 18px 4px 18px' : '8px',
    background: error 
      ? 'rgba(248,113,113,0.1)' 
      : (role === 'user' ? '#141e35' : 'rgba(30,41,59,0.5)'),
    border: error
      ? '1px solid rgba(248,113,113,0.3)'
      : (role === 'user' ? '1px solid rgba(34,211,238,0.15)' : '1px solid rgba(71,85,105,0.2)'),
    color: error ? '#fca5a5' : 'var(--text)',
    fontSize: '15px',
    lineHeight: '1.6',
    wordBreak: 'break-word',
  }),

  // Attachments area (inside bubble)
  attachments: {
    marginTop: '8px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  attachmentImage: {
    width: '100px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
  },

  attachmentLink: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    background: 'rgba(255,255,255,0.02)',
    padding: '6px 8px',
    borderRadius: '6px',
  },

  // Blinking cursor shown at end of streaming text
  cursor: {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    background: 'var(--accent)',
    marginLeft: '2px',
    verticalAlign: 'text-bottom',
    borderRadius: '1px',
    animation: 'blink 0.9s ease infinite',
  },
}

export default function MessageBubble({ role, content, streaming = false, error = false, files = [] }) {
  const avatarLabel = role === 'user' ? 'U' : 'AI'

  return (
    <div style={styles.wrapper(role)}>
      {/* Avatar circle */}
      <div style={styles.avatar(role)}>{avatarLabel}</div>

      {/* Message content */}
      <div style={styles.bubble(role, error)}>
        {role === 'assistant' && !error ? (
          <>
            <MarkdownMessage content={content} />
            {/* Show blinking cursor only on the streaming message */}
            {streaming && <span style={styles.cursor} aria-hidden="true" />}
          </>
        ) : (
          <>
            {content}
            {/* Show blinking cursor only on the streaming message */}
            {streaming && <span style={styles.cursor} aria-hidden="true" />}
          </>
        )}

        {/* Attachments (if any) */}
        {files && files.length > 0 && (
          <div style={styles.attachments}>
            {files.map((f, i) => (
              f.url && f.type && f.type.startsWith('image/') ? (
                <img
                  key={i}
                  src={f.url}
                  alt={f.name}
                  style={styles.attachmentImage}
                  onClick={() => window.open(f.url, '_blank')}
                />
              ) : (
                <a key={i} href={f.url || '#'} target="_blank" rel="noopener noreferrer" style={styles.attachmentLink}>
                  📄 {f.name}
                </a>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}