// ============================================================
//  WatchlistContext — localStorage-backed watchlist
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const WatchlistContext = createContext(null)

const STORAGE_KEY = 'trangmix_watchlist'

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
    } catch {
      console.warn('[TrangMix] Could not save watchlist to localStorage')
    }
  }, [watchlist])

  const addToWatchlist = useCallback((media) => {
    setWatchlist(prev => {
      const exists = prev.some(item => item.id === media.id && item.media_type === media.media_type)
      if (exists) return prev
      return [{ ...media, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeFromWatchlist = useCallback((id, mediaType) => {
    setWatchlist(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)))
  }, [])

  const toggleWatchlist = useCallback((media) => {
    setWatchlist(prev => {
      const exists = prev.some(item => item.id === media.id && item.media_type === media.media_type)
      if (exists) return prev.filter(item => !(item.id === media.id && item.media_type === media.media_type))
      return [{ ...media, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const isInWatchlist = useCallback((id, mediaType) => {
    return watchlist.some(item => item.id === id && item.media_type === mediaType)
  }, [watchlist])

  const clearWatchlist = useCallback(() => setWatchlist([]), [])

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      clearWatchlist,
      count: watchlist.length,
    }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider')
  return ctx
}

export default WatchlistContext
