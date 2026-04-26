import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { discoverMedia } from "../api/tmdb";
import MediaCard from "../components/MediaCard";
import CardSkeleton from "../components/CardSkeleton";

const MOODS = [
  { key: "thrilled",  label: "Thrilled",   emoji: "⚡", desc: "Edge-of-your-seat action",   color: "#f59e0b", genres: [28, 12, 53] },
  { key: "romantic",  label: "Romantic",   emoji: "🌹", desc: "Love stories & heartfelt drama", color: "#f43f5e", genres: [10749, 18] },
  { key: "scared",    label: "Scared",     emoji: "👻", desc: "Chills, thrills & nightmares",  color: "#8b5cf6", genres: [27, 9648] },
  { key: "inspired",  label: "Inspired",   emoji: "🌅", desc: "Stories that move you",         color: "#06b6d4", genres: [18, 36, 10752] },
  { key: "laughing",  label: "Laughing",   emoji: "😂", desc: "Pure comedy gold",              color: "#22c55e", genres: [35, 10751] },
  { key: "nostalgic", label: "Nostalgic",  emoji: "🎞️", desc: "Classic & timeless films",     color: "#f97316", genres: [16, 14, 10751] },
  { key: "mindblown", label: "Mind-Blown", emoji: "🤯", desc: "Sci-fi & thought-provokers",    color: "#3b82f6", genres: [878, 9648, 14] },
  { key: "chill",     label: "Chill",      emoji: "☁️", desc: "Easy watching, no stress",     color: "#14b8a6", genres: [35, 10751, 16] },
];

export default function MoodPicker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);

  const pickMood = async (mood) => {
    setSelected(mood);
    setLoading(true);
    setResults([]);
    try {
      const data = await discoverMedia("movie", {
        with_genres: mood.genres.join(","),
        sort_by: "popularity.desc",
        "vote_count.gte": 100,
      });
      setResults(data?.results || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-20 px-6 md:px-16 max-w-7xl mx-auto">

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3">
          <Zap size={13} /> Mood Match
        </div>
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight mb-3">
          How are you feeling?
        </h1>
        <p className="text-white/40 text-base max-w-sm mx-auto">
          Pick a mood and we'll find the perfect watch for tonight.
        </p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-14 max-w-3xl mx-auto">
        {MOODS.map((mood, i) => (
          <motion.button
            key={mood.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => pickMood(mood)}
            className={`mood-pick-card relative p-5 rounded-2xl text-left transition-all ${selected?.key === mood.key ? "ring-2" : "ring-1 ring-white/8"}`}
            style={{
              background: selected?.key === mood.key
                ? `color-mix(in srgb, ${mood.color} 18%, transparent)`
                : "rgba(255,255,255,0.04)",
              "--ring-color": mood.color,
              ringColor: selected?.key === mood.key ? mood.color : "transparent",
              outline: selected?.key === mood.key ? `2px solid ${mood.color}44` : "2px solid transparent",
            }}
          >
            <span className="text-3xl mb-3 block">{mood.emoji}</span>
            <p className="text-white font-bold text-sm mb-1">{mood.label}</p>
            <p className="text-white/40 text-xs leading-snug">{mood.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence>
        {(loading || results.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-6">
              {selected && (
                <>
                  <span className="text-2xl">{selected.emoji}</span>
                  <h2 className="text-white font-bold text-xl">
                    {selected.label} picks
                  </h2>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
                : results.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}>
                      <MediaCard item={{ ...item, media_type: "movie" }} />
                    </motion.div>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
