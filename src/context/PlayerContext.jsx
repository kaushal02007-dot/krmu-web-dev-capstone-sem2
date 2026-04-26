// ============================================================
//  PlayerContext — Mini-player & playback state
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState({
    isOpen: false,
    isMini: false,
    media: null,       // { id, title, backdrop_path, media_type }
    videoKey: null,    // YouTube key from TMDB
    progress: 0,       // 0–100
    isMuted: false,
    isPlaying: false,
  })

  const openPlayer = useCallback((media, videoKey) => {
    setPlayer(prev => ({
      ...prev,
      isOpen: true,
      isMini: false,
      media,
      videoKey,
      isPlaying: true,
    }))
  }, [])

  const minimizePlayer = useCallback(() => {
    setPlayer(prev => ({ ...prev, isMini: true }))
  }, [])

  const maximizePlayer = useCallback(() => {
    setPlayer(prev => ({ ...prev, isMini: false }))
  }, [])

  const closePlayer = useCallback(() => {
    setPlayer(prev => ({
      ...prev,
      isOpen: false,
      isMini: false,
      media: null,
      videoKey: null,
      isPlaying: false,
      progress: 0,
    }))
  }, [])

  const toggleMute = useCallback(() => {
    setPlayer(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }, [])

  const togglePlay = useCallback(() => {
    setPlayer(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }, [])

  return (
    <PlayerContext.Provider value={{
      player,
      openPlayer,
      minimizePlayer,
      maximizePlayer,
      closePlayer,
      toggleMute,
      togglePlay,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}

export default PlayerContext
