/**
 * main.jsx — Vite's entry point.
 *
 * This file mounts the React app into the <div id="root"> in index.html.
 * You rarely need to edit this file.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)