/**
 * App.jsx — The root component. Wires everything together.
 *
 * Layout:
 *   ┌──────────────────────┐
 *   │        Header        │  ← title + new chat button
 *   ├──────────────────────┤
 *   │                      │
 *   │     ChatWindow       │  ← scrollable messages (flex: 1, fills remaining height)
 *   │                      │
 *   ├──────────────────────┤
 *   │       InputBar       │  ← text input + file upload
 *   └──────────────────────┘
 *
 * All chat state lives in useChat() and is passed down as props.
 * App itself has no state — it's just the layout shell.
 */

import { useChat } from './hooks/useChat.js'
import ChatWindow from './components/ChatWindow.jsx'
import InputBar from './components/InputBar.jsx'

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  // Full-screen flex column — header + chat + input stacked vertically
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    background: 'var(--bg)',
    overflow: 'hidden',
  },

  // Top header bar
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
    background: 'rgba(9,11,18,0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },

  // Brand / title on the left
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },

  // Glowing dot next to the title
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent-glow)',
  },

  title: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text)',
    letterSpacing: '-0.2px',
  },

  modelBadge: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2px 8px',
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-mono)',
  },


  attribution: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    marginLeft: '10px',
  },

  // New Chat button
  newChatBtn: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-dim)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
    fontFamily: 'var(--font)',
  },
}

export default function App() {
  const {
    messages,
    streamingText,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearChat,
  } = useChat()

  return (
    <div style={styles.shell}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.dot} aria-hidden="true" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={styles.title}>Robinson Chatbot</span>
              <span style={styles.modelBadge}>nemotron-nano-2-vl</span>
            </div>
            <div style={styles.attribution}>Robinson Chatbot by Kavindu Pramod</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            style={styles.newChatBtn}
            onClick={clearChat}
            title="Start a new conversation"
          >
            + New Chat
          </button>
        </div>
      </header>

      {/* ── Chat messages ─────────────────────────────────────────────────── */}
      <ChatWindow
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
        error={error}
      />

      {/* ── Input bar ────────────────────────────────────────────────────── */}
      <InputBar
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />

    </div>
  )
}