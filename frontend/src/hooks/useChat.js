/**
 * hooks/useChat.js — All chat logic in one place.
 *
 * A "hook" in React is just a function that manages state and logic,
 * so your components stay clean and focused only on displaying things.
 *
 * This hook handles:
 *   - Sending messages (with files) to the backend
 *   - Reading the SSE stream word by word
 *   - Keeping the conversation history
 *   - Cancelling a response mid-stream
 *   - Error handling
 *
 * SPEED EXPLANATION:
 *   We keep `streamingText` (the AI's current in-progress reply) SEPARATE
 *   from `messages` (the completed history). During streaming, only the
 *   streaming bubble re-renders — not the entire message list. 
 *   This avoids expensive re-renders of old messages on every word.
 */

import { useState, useRef, useCallback } from 'react'

const API_URL = 'http://localhost:8000/chat/'

export function useChat() {
  // Completed conversation history — array of { role, content }
  const [messages, setMessages] = useState([])

  // The AI's current in-progress reply — updates on every streamed word
  const [streamingText, setStreamingText] = useState('')

  // True while the AI is generating a response
  const [isStreaming, setIsStreaming] = useState(false)

  // Any error message to show the user
  const [error, setError] = useState(null)

  // Lets us cancel the fetch request if the user clicks Stop
  const abortControllerRef = useRef(null)
  // Keep track of preview URLs we create so we can revoke them
  const previewsRef = useRef([])

  // ── SEND MESSAGE ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, files = []) => {
    // Don't allow sending while already streaming, or with empty message
    if (isStreaming || !text.trim()) return

    setError(null)
    setStreamingText('')
    setIsStreaming(true)

    // Snapshot of history BEFORE this message (what we send to the backend)
    // We capture it here because setMessages is async
    const historySnapshot = messages

    // Create small preview URLs for the attached files so they remain visible
    // after the input clears. We store the previews in the message object.
    const filePreviews = files.map(f => {
      try {
        const url = URL.createObjectURL(f)
        previewsRef.current.push(url)
        return { name: f.name, type: f.type, url }
      } catch {
        return { name: f.name, type: f.type }
      }
    })

    // Immediately show the user's message in the UI (include attachment previews)
    const userMessage = { role: 'user', content: text, files: filePreviews }
    setMessages(prev => [...prev, userMessage])

    // Build FormData — this is how we send both text AND files in one request
    const formData = new FormData()
    formData.append('message', text)
    formData.append('history', JSON.stringify(historySnapshot))  // JSON string of history
    files.forEach(file => formData.append('files', file))        // each file as binary

    // Create a new AbortController so we can cancel this request later
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} — is the backend running?`)
      }

      // response.body is a ReadableStream — we read it chunk by chunk
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let accumulated = ''  // the full AI reply so far
      let buffer = ''       // incomplete SSE line buffer (chunks can split mid-line)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the binary chunk into text and add to our line buffer
        buffer += decoder.decode(value, { stream: true })

        // SSE lines are separated by \n — split and process complete lines
        // The last element may be incomplete, so we put it back in the buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep the possibly-incomplete last line

        for (const line of lines) {
          // SSE data lines start with "data: "
          if (!line.startsWith('data: ')) continue

          const payload = line.slice(6)  // remove "data: " prefix

          // The stream ends with this sentinel
          if (payload.trim() === '[DONE]') {
            // Move the completed response into the permanent history
            if (accumulated) {
              setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
            }
            setStreamingText('')
            setIsStreaming(false)
            return
          }

          // Parse the JSON chunk
          try {
            const parsed = JSON.parse(payload)

            if (parsed.error) {
              // Error can be a string or an object with a message property
              let errorMessage = parsed.error
              if (typeof parsed.error === 'object' && parsed.error.message) {
                errorMessage = parsed.error.message
              }
              setError(`⚠️ Error: ${errorMessage}`)
              setIsStreaming(false)
              return
            }

            if (parsed.content) {
              accumulated += parsed.content
              // Update the streaming bubble — only this re-renders, not the whole list
              setStreamingText(accumulated)
            }
          } catch {
            // skip malformed JSON chunks (can happen at start/end of stream)
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        // User clicked Stop — this is expected, not an error
        // Keep whatever was streamed so far as the final message
        if (streamingText) {
          setMessages(prev => [...prev, { role: 'assistant', content: streamingText + ' [stopped by user]' }])
        }
      } else {
        // Format different types of errors with helpful context
        let errorMessage = err.message
        if (err.message.includes('fetch')) {
          errorMessage = 'Could not connect to the backend. Is the server running on localhost:8000?'
        } else if (err.message.includes('400')) {
          errorMessage = 'Bad request — check your input and try again'
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error — the backend encountered an issue'
        } else if (err.message.includes('timeout') || err.message.includes('Timeout')) {
          errorMessage = 'Request timed out — the model may be overloaded or the backend is slow'
        }
        setError(`⚠️ ${errorMessage}`)
      }
    } finally {
      setStreamingText('')
      setIsStreaming(false)
    }
  }, [messages, isStreaming, streamingText])

  // ── STOP STREAMING ──────────────────────────────────────────────────────────
  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  // ── CLEAR CHAT ──────────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    // Revoke any created preview URLs
    previewsRef.current.forEach(u => {
      try { URL.revokeObjectURL(u) } catch (e) { console.warn('revoke preview failed', e) }
    })
    previewsRef.current = []

    setMessages([])
    setStreamingText('')
    setError(null)
    setIsStreaming(false)
  }, [])

  return {
    messages,        // completed message history
    streamingText,   // current in-progress AI reply
    isStreaming,     // true while AI is responding
    error,           // error string or null
    sendMessage,     // call this to send a message
    stopStreaming,   // call this to cancel mid-stream
    clearChat,       // call this to start a new conversation
  }
}