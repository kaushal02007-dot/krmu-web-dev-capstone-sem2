// ============================================================
//  TrangMix — Entry Point
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { AuthProvider }      from './context/AuthContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { PlayerProvider }    from './context/PlayerContext'
import { ThemeProvider }     from './context/ThemeContext'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Order matters: Auth → Theme → Watchlist → Player → App */}
      <AuthProvider>
        <ThemeProvider>
          <WatchlistProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </WatchlistProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
