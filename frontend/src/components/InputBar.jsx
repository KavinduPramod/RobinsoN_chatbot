/**
 * components/InputBar.jsx — The input area at the bottom of the chat.
 *
 * Features:
 *   - Auto-resizing textarea (grows as you type)
 *   - File attachment button (images + PDFs)
 *   - Send button / Stop button (switches during streaming)
 *   - Keyboard shortcut: Enter to send, Shift+Enter for new line
 *
 * Props:
 *   onSend      — callback(text, files) called when user submits
 *   onStop      — callback() called when user clicks Stop
 *   isStreaming — disables send while AI is responding
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import FilePreview from './FilePreview.jsx'

// Accepted file types (matches backend)
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,application/pdf'

const styles = {
  // Outer wrapper — sits at the bottom, slightly elevated
  wrapper: {
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    paddingBottom: '8px',
  },

  // Centered input column (same width as the chat messages above)
  inner: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '12px 20px 4px',
  },

  // The input card itself
  card: {
    background: 'var(--surface-hi)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-lg)',
    transition: 'border-color 0.2s',
    overflow: 'hidden',
  },

  cardFocused: {
    borderColor: 'rgba(34,211,238,0.35)',
  },

  // The textarea
  textarea: {
    width: '100%',
    background: 'transparent',
    color: 'var(--text)',
    fontSize: '15px',
    lineHeight: '1.6',
    padding: '14px 16px 4px',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '200px',
    overflow: 'auto',
    display: 'block',
  },

  // Bottom row: left side has attach button, right side has send/stop
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px 10px',
  },

  // Attach file button
  attachBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '17px',
    transition: 'color 0.15s, background 0.15s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },

  // Send button (cyan accent when active)
  sendBtn: (active) => ({
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'all 0.15s',
    background: active ? 'var(--accent)' : 'var(--surface)',
    border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
    color: active ? '#000' : 'var(--text-muted)',
    opacity: active ? 1 : 0.5,
  }),

  // Stop button (shown while streaming)
  stopBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    cursor: 'pointer',
    background: 'var(--danger-dim)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--danger)',
  },

  hint: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '4px 0 0',
  }
}

export default function InputBar({ onSend, onStop, isStreaming }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [focused, setFocused] = useState(false)

  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize the textarea as the user types
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  useEffect(() => { autoResize() }, [text, autoResize])

  // ── Handle text input ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setText(e.target.value)
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()  // prevent newline on Enter
      handleSend()
    }
    // Shift+Enter naturally inserts a newline (default behavior, no code needed)
  }

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    onSend(trimmed, files)

    // Clear input
    setText('')
    setFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    textareaRef.current?.focus()
  }

  // ── File attachment ───────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
    e.target.value = ''  // reset so same file can be added again if removed
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const canSend = text.trim().length > 0 && !isStreaming

  return (
    <div style={styles.wrapper}>
      <div style={styles.inner}>

        {/* File previews above the input card */}
        <FilePreview files={files} onRemove={removeFile} />

        {/* Input card */}
        <div style={{ ...styles.card, ...(focused ? styles.cardFocused : {}) }}>

          {/* Hidden file input — triggered by the attach button */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Message..."
            style={styles.textarea}
            rows={1}
            disabled={isStreaming}
          />

          {/* Action row */}
          <div style={styles.actions}>

            {/* Attach button */}
            <button
              style={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach image or PDF"
              aria-label="Attach file"
            >
              📎
            </button>

            {/* Send / Stop button */}
            {isStreaming ? (
              <button
                style={styles.stopBtn}
                onClick={onStop}
                title="Stop generating"
                aria-label="Stop"
              >
                ■
              </button>
            ) : (
              <button
                style={styles.sendBtn(canSend)}
                onClick={handleSend}
                disabled={!canSend}
                title="Send (Enter)"
                aria-label="Send message"
              >
                ↑
              </button>
            )}

          </div>
        </div>

        <p style={styles.hint}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}