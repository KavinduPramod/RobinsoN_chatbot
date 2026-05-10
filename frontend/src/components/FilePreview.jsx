/**
 * components/FilePreview.jsx — Shows a preview of files the user has attached.
 *
 * Props:
 *   files     — array of File objects
 *   onRemove  — callback(index) to remove a file from the list
 */

import { useEffect, useState } from 'react'

function isImageFile(file) {
  if (file.type && file.type.startsWith('image/')) return true
  const name = (file.name || '').toLowerCase()
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)
}

const styles = {
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px 16px 0',
  },

  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: 'var(--surface-hi)',
    border: '1px solid var(--border-hi)',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 8px',
    maxWidth: '180px',
  },

  // Image thumbnail for image files
  thumbnail: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    objectFit: 'cover',
    flexShrink: 0,
  },

  // File icon for non-image files (PDFs etc.)
  fileIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    background: 'rgba(34,211,238,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    flexShrink: 0,
  },

  filename: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100px',
  },

  removeBtn: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#374151',
    color: '#9ca3af',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    lineHeight: 1,
    padding: 0,
    transition: 'background 0.15s',
  },
}

function FileItem({ file, onRemove }) {
  const isImage = isImageFile(file)
  const [previewDataUrl, setPreviewDataUrl] = useState('')

  useEffect(() => {
    if (!isImage) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewDataUrl(reader.result)
      }
    }
    reader.onerror = () => {
      console.warn('failed to read image preview')
      setPreviewDataUrl('')
    }

    try {
      reader.readAsDataURL(file)
    } catch (e) {
      console.warn('failed to generate image preview', e)
    }

    return () => {
      // Abort read if the item unmounts during file processing.
      if (reader.readyState === 1) {
        reader.abort()
      }
    }
  }, [file, isImage])

  // Short display name
  const shortName = file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name

  const openPreview = () => {
    if (!previewDataUrl) return
    // Open image/pdf in a new tab for quick preview
    window.open(previewDataUrl, '_blank')
  }

  return (
    <div style={styles.item}>
      {isImage && previewDataUrl ? (
        <img src={previewDataUrl} alt={file.name} style={styles.thumbnail} onClick={openPreview} />
      ) : (
        <div style={styles.fileIcon} onClick={openPreview}>📄</div>
      )}
      <span style={styles.filename} title={file.name}>{shortName}</span>
      <button
        style={styles.removeBtn}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        ✕
      </button>
    </div>
  )
}

export default function FilePreview({ files, onRemove }) {
  if (!files || files.length === 0) return null

  return (
    <div style={styles.row}>
      {files.map((file, i) => (
        <FileItem
          key={`${file.name}-${i}`}
          file={file}
          onRemove={() => onRemove(i)}
        />
      ))}
    </div>
  )
}