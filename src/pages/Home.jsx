import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Info, ChevronRight, Star, TrendingUp, Zap } from "lucide-react";
import { fetchTrending, fetchPopular, fetchTopRated, getImageUrl } from "../api/tmdb";
import { useWatchlist } from "../context/WatchlistContext";
import { useTheme } from "../context/ThemeContext";
import MediaCard from "../components/MediaCard";
import CardSkeleton from "../components/CardSkeleton";
import HeroSkeleton from "../components/HeroSkeleton";

// ─── Hero Banner ───────────────────────────────────────────────────────────────
function HeroBanner({ items }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { extractColors } = useTheme();

  const current = items[index];

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % Math.min(items.length, 5));
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    setLoaded(false);
    if (current?.backdrop_path) {
      const img = new Image();
      img.src = getImageUrl(current.backdrop_path, "original");
      img.onload = () => {
        setLoaded(true);
        extractColors && extractColors(getImageUrl(current.poster_path, "w500"));
      };
    }
  }, [index, current]);

  if (!items.length) return <HeroSkeleton />;

  const title = current?.title || current?.name || "";
  const overview = current?.overview || "";
  const rating = current?.vote_average?.toFixed(1);
  const mediaType = current?.media_type || "movie";
  const id = current?.id;

  return (
    <div className="hero-banner relative w-full overflow-hidden" style={{ height: "92vh", minHeight: 520 }}>
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: loaded ? 1 : 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(current?.backdrop_path, "original")}
            alt={title}
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${index}`}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-28"
        >
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-trending">
              <TrendingUp size={11} /> TRENDING
            </span>
            <span className="text-white/50 text-xs font-mono">#{index + 1} Today</span>
          </div>

          {/* Title */}
          <h1 className="hero-title text-5xl md:text-7xl font-black text-white leading-none mb-4 max-w-2xl">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-5">
            <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
              <Star size={14} fill="currentColor" /> {rating}
            </span>
            <span className="text-white/40 text-sm capitalize">{mediaType}</span>
            <span className="text-white/40 text-sm">
              {(current?.release_date || current?.first_air_date || "").slice(0, 4)}
            </span>
          </div>

          {/* Overview */}
          <p className="text-white/70 text-sm md:text-base max-w-xl leading-relaxed mb-8 line-clamp-3">
            {overview}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/${mediaType}/${id}`)}
              className="btn-hero-primary"
            >
              <Play size={18} fill="currentColor" /> Watch Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/${mediaType}/${id}`)}
              className="btn-hero-secondary"
            >
              <Info size={16} /> More Info
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: isInWatchlist(id) ? -10 : 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleWatchlist(current)}
              className={`btn-hero-icon ${isInWatchlist(id) ? "active" : ""}`}
            >
              <Plus size={20} />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-20 right-8 md:right-16 flex gap-2">
        {items.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`hero-dot ${i === index ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, linkTo }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-5 px-8 md:px-16">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-[var(--color-accent)]" />}
        <h2 className="text-white font-bold text-xl tracking-tight">{label}</h2>
      </div>
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-1 text-[var(--color-accent)] text-sm hover:gap-2 transition-all"
        >
          See all <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Horizontal Scroll Row ─────────────────────────────────────────────────────
function MediaRow({ items, loading, count = 10 }) {
  return (
    <div className="media-row overflow-x-auto px-8 md:px-16 pb-4 no-scrollbar">
      <div className="flex gap-4" style={{ width: "max-content" }}>
        {loading
          ? Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)
          : items.slice(0, count).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <MediaCard item={item} />
              </motion.div>
            ))}
      </div>
    </div>
  );
}

// ─── Mood Teaser Strip ─────────────────────────────────────────────────────────
const MOODS = [
  { label: "Thrilled", emoji: "⚡", color: "#f59e0b" },
  { label: "Romantic", emoji: "🌹", color: "#f43f5e" },
  { label: "Scared", emoji: "👻", color: "#8b5cf6" },
  { label: "Inspired", emoji: "🌅", color: "#06b6d4" },
  { label: "Laughing", emoji: "😂", color: "#22c55e" },
  { label: "Nostalgic", emoji: "🎞️", color: "#f97316" },
];

function MoodTeaser() {
  const navigate = useNavigate();
  return (
    <div className="mood-teaser mx-8 md:mx-16 my-10 rounded-2xl overflow-hidden relative p-8 cursor-pointer"
      onClick={() => navigate("/mood")}>
      <div className="mood-teaser-bg absolute inset-0" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-[var(--color-accent)]" />
          <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest">New Feature</span>
        </div>
        <h3 className="text-white text-2xl font-black mb-1">What's your mood tonight?</h3>
        <p className="text-white/60 text-sm mb-6">Let your feelings pick your next watch.</p>
        <div className="flex gap-3 flex-wrap">
          {MOODS.map((m) => (
            <motion.span
              key={m.label}
              whileHover={{ scale: 1.1, y: -2 }}
              className="mood-chip"
              style={{ "--mood-color": m.color }}
            >
              {m.emoji} {m.label}
            </motion.span>
          ))}
        </div>
      </div>
      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-16 h-16 rounded-full"
        style={{ background: "var(--color-accent)" }}
        whileHover={{ scale: 1.15 }}
      >
        <ChevronRight size={28} className="text-black" />
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedTV, setTopRatedTV] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingTV, setLoadingTV] = useState(true);

  useEffect(() => {
    fetchTrending("all", "week")
      .then((data) => setTrending(data?.results || []))
      .finally(() => setLoadingTrending(false));

    fetchPopular("movie")
      .then((data) => setPopularMovies(data?.results || []))
      .finally(() => setLoadingMovies(false));

    fetchTopRated("tv")
      .then((data) => setTopRatedTV(data?.results || []))
      .finally(() => setLoadingTV(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero */}
      <HeroBanner items={trending} />

      {/* Trending */}
      <section className="mt-[-60px] relative z-10 mb-10">
        <SectionHeader icon={TrendingUp} label="Trending This Week" linkTo="/discover" />
        <MediaRow items={trending} loading={loadingTrending} />
      </section>

      {/* Mood Teaser */}
      <MoodTeaser />

      {/* Popular Movies */}
      <section className="mb-10">
        <SectionHeader icon={Star} label="Popular Movies" linkTo="/discover?type=movie" />
        <MediaRow items={popularMovies} loading={loadingMovies} />
      </section>

      {/* Top Rated TV */}
      <section className="mb-16">
        <SectionHeader icon={Zap} label="Top Rated TV Shows" linkTo="/discover?type=tv" />
        <MediaRow items={topRatedTV} loading={loadingTV} />
      </section>
    </motion.div>
  );
}
