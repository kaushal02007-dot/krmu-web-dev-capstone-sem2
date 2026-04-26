import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Tv, SlidersHorizontal, ChevronDown, Loader2, X } from "lucide-react";
import { discoverMedia, fetchGenres } from "../api/tmdb";
import MediaCard from "../components/MediaCard";
import CardSkeleton from "../components/CardSkeleton";

// ─── Constants ─────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "popularity.desc",        label: "Most Popular" },
  { value: "vote_average.desc",      label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest First" },
  { value: "revenue.desc",           label: "Highest Grossing" },
];

const YEAR_OPTIONS = [
  { value: "", label: "Any Year" },
  ...Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: String(y), label: String(y) };
  }),
];

// ─── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="discover-dropdown-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
      >
        {selected?.label || label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="discover-dropdown-menu absolute top-full mt-2 left-0 z-30 min-w-44 rounded-xl py-1 shadow-2xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`discover-dropdown-item w-full text-left px-4 py-2 text-sm transition-colors ${value === opt.value ? "active" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Genre Pills ───────────────────────────────────────────────────────────────
function GenreFilter({ genres, selected, onToggle }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {genres.map((g) => (
        <motion.button
          key={g.id}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onToggle(g.id)}
          className={`genre-filter-pill px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selected.includes(g.id) ? "active" : ""
          }`}
        >
          {g.name}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Active Filter Tags ────────────────────────────────────────────────────────
function ActiveFilters({ genres, selectedGenres, sortBy, year, onRemoveGenre, onClearAll }) {
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;
  const hasFilters = selectedGenres.length > 0 || year;

  if (!hasFilters) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-white/30 text-xs">Active:</span>
      {selectedGenres.map((gid) => {
        const g = genres.find((x) => x.id === gid);
        return g ? (
          <span key={gid} className="active-filter-tag flex items-center gap-1">
            {g.name}
            <button onClick={() => onRemoveGenre(gid)} className="hover:text-white transition-colors">
              <X size={10} />
            </button>
          </span>
        ) : null;
      })}
      {year && (
        <span className="active-filter-tag flex items-center gap-1">
          {year}
        </span>
      )}
      <button onClick={onClearAll} className="text-white/30 text-xs hover:text-white/60 transition-colors ml-1">
        Clear all
      </button>
    </div>
  );
}

// ─── Main Discover Page ────────────────────────────────────────────────────────
export default function Discover() {
  const [mediaType, setMediaType]     = useState("movie");
  const [genres, setGenres]           = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy]           = useState("popularity.desc");
  const [year, setYear]               = useState("");
  const [results, setResults]         = useState([]);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loaderRef = useRef(null);

  // Load genres when media type changes
  useEffect(() => {
    fetchGenres(mediaType).then((d) => setGenres(d?.genres || []));
  }, [mediaType]);

  // Reset and fetch on filter change
  useEffect(() => {
    setPage(1);
    setResults([]);
    setLoading(true);

    const params = {
      sort_by: sortBy,
      with_genres: selectedGenres.join(","),
      ...(year && mediaType === "movie"
        ? { primary_release_year: year }
        : year
        ? { first_air_date_year: year }
        : {}),
      "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 0,
    };

    discoverMedia(mediaType, { ...params, page: 1 })
      .then((d) => {
        setResults(d?.results || []);
        setTotalPages(d?.total_pages || 1);
      })
      .finally(() => setLoading(false));
  }, [mediaType, selectedGenres, sortBy, year]);

  // Infinite scroll — load more
  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setLoadingMore(true);

    const params = {
      sort_by: sortBy,
      with_genres: selectedGenres.join(","),
      ...(year && mediaType === "movie"
        ? { primary_release_year: year }
        : year
        ? { first_air_date_year: year }
        : {}),
      "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 0,
      page: next,
    };

    discoverMedia(mediaType, params)
      .then((d) => {
        setResults((prev) => [...prev, ...(d?.results || [])]);
        setPage(next);
      })
      .finally(() => setLoadingMore(false));
  }, [page, totalPages, loadingMore, mediaType, selectedGenres, sortBy, year]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setYear("");
    setSortBy("popularity.desc");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-20 px-6 md:px-16 max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-black mb-1 tracking-tight">Discover</h1>
        <p className="text-white/40 text-sm">
          {results.length > 0 ? `${results.length}+ titles` : "Browse everything"}
        </p>
      </div>

      {/* ── Type Toggle ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="type-toggle flex rounded-xl overflow-hidden p-1 bg-white/5 ring-1 ring-white/8">
          {[
            { key: "movie", label: "Movies", icon: Film },
            { key: "tv",    label: "TV Shows", icon: Tv },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setMediaType(key); setSelectedGenres([]); }}
              className={`type-toggle-btn flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mediaType === key ? "active" : ""}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Filter toggle (mobile) */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters ? "bg-[var(--color-accent)] text-black" : "discover-dropdown-btn"}`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {selectedGenres.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-black/30 text-xs flex items-center justify-center">
              {selectedGenres.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter Panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="discover-filter-panel rounded-2xl p-6 space-y-5 ring-1 ring-white/8 bg-white/3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">Filter by Genre</span>
                {selectedGenres.length > 0 && (
                  <button onClick={() => setSelectedGenres([])} className="text-white/30 text-xs hover:text-white/60 transition-colors">
                    Clear genres
                  </button>
                )}
              </div>
              <GenreFilter genres={genres} selected={selectedGenres} onToggle={toggleGenre} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sort + Year Bar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Dropdown label="Sort by" value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
        <Dropdown label="Year" value={year} options={YEAR_OPTIONS} onChange={setYear} />
      </div>

      {/* ── Active Filter Tags ── */}
      <div className="mb-6">
        <ActiveFilters
          genres={genres}
          selectedGenres={selectedGenres}
          sortBy={sortBy}
          year={year}
          onRemoveGenre={toggleGenre}
          onClearAll={clearFilters}
        />
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Film size={24} className="text-white/20" />
          </div>
          <p className="text-white/40 text-base">No titles match these filters</p>
          <button onClick={clearFilters} className="mt-3 text-[var(--color-accent)] text-sm hover:underline">
            Clear filters
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {results.map((item, i) => (
              <motion.div
                key={`${item.id}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
              >
                <MediaCard item={{ ...item, media_type: item.media_type || mediaType }} />
              </motion.div>
            ))}
          </motion.div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="flex justify-center py-10">
            {loadingMore && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 size={28} className="text-[var(--color-accent)] animate-spin opacity-60" />
              </motion.div>
            )}
            {!loadingMore && page >= totalPages && results.length > 0 && (
              <p className="text-white/20 text-sm">You've seen it all</p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
