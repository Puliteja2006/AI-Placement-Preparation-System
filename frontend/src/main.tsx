import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.tsx'
import './index.css'
import { API_BASE } from './api'

// Redirect any call to http://localhost:8080 to the real backend (Render)
axios.interceptors.request.use((cfg) => {
  const local = 'http://localhost:8080'
  if (typeof cfg.url === 'string' && cfg.url.startsWith(local)) {
    cfg.url = API_BASE + cfg.url.substring(local.length)
  }
  return cfg
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
