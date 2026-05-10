/**
 * components/MarkdownMessage.jsx — Renders markdown content with proper formatting
 *
 * Supports:
 *   - Code blocks with syntax highlighting
 *   - Inline code
 *   - Bold, italic, strikethrough
 *   - Lists (ordered and unordered)
 *   - Tables (GitHub Flavored Markdown)
 *   - Links and images
 *   - Headings
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'

const markdownStyles = {
  // Code blocks
  pre: {
    background: '#0f172a',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    padding: '14px',
    overflowX: 'auto',
    marginTop: '10px',
    marginBottom: '10px',
    fontSize: '13px',
    lineHeight: '1.5',
  },

  code: {
    background: 'rgba(148, 163, 184, 0.1)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontFamily: 'Fira Code, monospace',
    fontSize: '13px',
  },

  // Inline code (inside paragraphs)
  inlineCode: {
    background: 'rgba(148, 163, 184, 0.1)',
    color: '#e0e7ff',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: 'Fira Code, monospace',
    fontSize: '0.9em',
  },

  // Headings
  h1: {
    fontSize: '24px',
    fontWeight: '700',
    marginTop: '16px',
    marginBottom: '10px',
    color: '#e2e8f0',
  },

  h2: {
    fontSize: '20px',
    fontWeight: '600',
    marginTop: '14px',
    marginBottom: '8px',
    color: '#cbd5e1',
  },

  h3: {
    fontSize: '17px',
    fontWeight: '600',
    marginTop: '12px',
    marginBottom: '6px',
    color: '#cbd5e1',
  },

  // Lists
  ul: {
    marginLeft: '20px',
    marginTop: '8px',
    marginBottom: '8px',
  },

  ol: {
    marginLeft: '20px',
    marginTop: '8px',
    marginBottom: '8px',
  },

  li: {
    marginBottom: '4px',
    lineHeight: '1.6',
  },

  // Blockquotes
  blockquote: {
    borderLeft: '4px solid rgba(34, 211, 238, 0.4)',
    paddingLeft: '12px',
    marginLeft: '0',
    marginTop: '8px',
    marginBottom: '8px',
    color: 'rgba(226, 232, 240, 0.8)',
    fontStyle: 'italic',
  },

  // Tables
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '10px',
    marginBottom: '10px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },

  th: {
    background: 'rgba(148, 163, 184, 0.1)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#cbd5e1',
  },

  td: {
    border: '1px solid rgba(148, 163, 184, 0.15)',
    padding: '8px 12px',
  },

  // Links
  a: {
    color: '#22d3ee',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(34, 211, 238, 0.3)',
  },

  // Horizontal rule
  hr: {
    borderTop: '1px solid rgba(148, 163, 184, 0.2)',
    margin: '16px 0',
  },

  // Strong emphasis
  strong: {
    fontWeight: '600',
    color: '#f1f5f9',
  },

  // Emphasis
  em: {
    fontStyle: 'italic',
    color: 'rgba(226, 232, 240, 0.9)',
  },
}

const components = {
  // Code block with syntax highlighting
  code({ inline, children, ...props }) {
    if (inline) {
      return (
        <code style={markdownStyles.inlineCode} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code style={{ color: 'inherit' }} {...props}>
        {children}
      </code>
    )
  },

  // Pre (code block wrapper)
  pre({ children }) {
    return <pre style={markdownStyles.pre}>{children}</pre>
  },

  // Headings
  h1: ({ children }) => <h1 style={markdownStyles.h1}>{children}</h1>,
  h2: ({ children }) => <h2 style={markdownStyles.h2}>{children}</h2>,
  h3: ({ children }) => <h3 style={markdownStyles.h3}>{children}</h3>,

  // Lists
  ul: ({ children }) => <ul style={markdownStyles.ul}>{children}</ul>,
  ol: ({ children }) => <ol style={markdownStyles.ol}>{children}</ol>,
  li: ({ children }) => <li style={markdownStyles.li}>{children}</li>,

  // Blockquote
  blockquote: ({ children }) => <blockquote style={markdownStyles.blockquote}>{children}</blockquote>,

  // Table
  table: ({ children }) => <table style={markdownStyles.table}>{children}</table>,
  th: ({ children }) => <th style={markdownStyles.th}>{children}</th>,
  td: ({ children }) => <td style={markdownStyles.td}>{children}</td>,

  // Links
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={markdownStyles.a}>
      {children}
    </a>
  ),

  // Horizontal rule
  hr: () => <hr style={markdownStyles.hr} />,

  // Strong
  strong: ({ children }) => <strong style={markdownStyles.strong}>{children}</strong>,

  // Emphasis
  em: ({ children }) => <em style={markdownStyles.em}>{children}</em>,
}

export default function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
