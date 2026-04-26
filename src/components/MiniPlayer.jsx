import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Play, Pause } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const { state, closePlayer, maximizePlayer } = usePlayer();

  // ✅ FIX: prevent crash if state is undefined
  const { isOpen, isMinimized, current } = state || {};

  if (!isOpen || !isMinimized || !current) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="mini-player"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 120) closePlayer();
        }}
      >
        {/* Poster thumbnail */}
        <div className="mini-player__thumb">
          {current.poster && (
            <img
              src={`https://image.tmdb.org/t/p/w92${current.poster}`}
              alt={current.title}
            />
          )}
        </div>

        {/* Info */}
        <div className="mini-player__info">
          <p className="mini-player__title">{current.title}</p>
          <p className="mini-player__sub">{current.year}</p>
        </div>

        {/* Controls */}
        <div className="mini-player__controls">
          <button
            className="icon-btn"
            onClick={maximizePlayer}
            aria-label="Expand player"
          >
            <Maximize2 size={18} />
          </button>
          <button
            className="icon-btn"
            onClick={closePlayer}
            aria-label="Close player"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drag hint bar */}
        <div className="mini-player__drag-hint" aria-hidden="true" />
      </motion.div>
    </AnimatePresence>
  );
}