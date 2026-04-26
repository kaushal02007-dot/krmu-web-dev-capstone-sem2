import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, Film, Tv, User, Loader2, TrendingUp } from "lucide-react";
import { searchMulti, fetchTrending, getImageUrl } from "../api/tmdb";
import { useNavigate, useSearchParams } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import CardSkeleton from "../components/CardSkeleton";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const FILTERS = [
  { key: "all",    label: "All",    icon: SearchIcon },
  { key: "movie",  label: "Movies", icon: Film },
  { key: "tv",     label: "TV",     icon: Tv },
  { key: "person", label: "People", icon: User },
];

function PersonCard({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 transition-colors cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/8 flex-shrink-0">
        {item.profile_path ? (
          <img src={getImageUrl(item.profile_path, "w185")} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-lg font-bold">
            {item.name?.[0]}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm font-semibold truncate">{item.name}</p>
        <p className="text-white/40 text-xs truncate">{item.known_for_department}</p>
        <p className="text-white/30 text-xs truncate mt-0.5">
          {item.known_for?.slice(0, 2).map(k => k.title || k.name).join(", ")}
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5">
        <SearchIcon size={32} className="text-white/20" />
      </div>
      <p className="text-white/60 text-lg font-semibold mb-1">No results for "{query}"</p>
      <p className="text-white/30 text-sm">Try a different title, actor, or keyword</p>
    </motion.div>
  );
}

function TrendingStrip({ items, loading }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={16} className="text-[var(--color-accent)]" />
        <h2 className="text-white font-bold text-base">Trending Now</h2>
      </div>
      <div className="overflow-x-auto no-scrollbar -mx-1">
        <div className="flex gap-3 px-1 pb-2" style={{ width: "max-content" }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} size="sm" />)
            : items.slice(0, 10).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <MediaCard item={item} size="sm" />
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const [query, setQuery]               = useState(searchParams.get("q") || "");
  const [filter, setFilter]             = useState("all");
  const [results, setResults]           = useState([]);
  const [trending, setTrending]         = useState([]);
  const [searching, setSearching]       = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 380);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  useEffect(() => {
    fetchTrending("all", "day")
      .then((d) => setTrending(d?.results || []))
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setTotalResults(0); return; }
    setSearching(true);
    searchMulti(debouncedQuery)
      .then((d) => { setResults(d?.results || []); setTotalResults(d?.total_results || 0); })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const filtered = filter === "all" ? results : results.filter((r) => r.media_type === filter);
  const movies  = results.filter((r) => r.media_type === "movie");
  const tv      = results.filter((r) => r.media_type === "tv");
  const people  = results.filter((r) => r.media_type === "person");
  const hasResults = filtered.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-20 px-6 md:px-16 max-w-7xl mx-auto">

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="relative mb-8">
        <div className="flex items-center gap-3 rounded-2xl px-5 py-4 ring-1 ring-white/10 bg-white/5 backdrop-blur-md focus-within:ring-[var(--color-accent)]/60 transition-all">
          <AnimatePresence mode="wait">
            {searching
              ? <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader2 size={20} className="text-[var(--color-accent)] animate-spin" /></motion.div>
              : <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SearchIcon size={20} className="text-white/40" /></motion.div>
            }
          </AnimatePresence>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, shows, people…"
            className="flex-1 bg-transparent text-white placeholder-white/30 text-lg outline-none font-medium"
          />
          <AnimatePresence>
            {query && (
              <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setQuery("")}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X size={13} className="text-white/60" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <AnimatePresence>
        {query && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2 mb-8 flex-wrap">
            {FILTERS.map(({ key, label, icon: Icon }) => {
              const count = key === "all" ? results.length : key === "movie" ? movies.length : key === "tv" ? tv.length : people.length;
              return (
                <button key={key} onClick={() => setFilter(key)}
                  className={`search-filter-tab flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === key ? "active" : ""}`}>
                  <Icon size={13} />{label}
                  {count > 0 && <span className="ml-1 text-xs opacity-70">({count})</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!query && (
          <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrendingStrip items={trending} loading={loadingTrending} />
          </motion.div>
        )}

        {query && searching && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center pt-16">
            <Loader2 size={36} className="text-[var(--color-accent)] animate-spin opacity-60" />
          </motion.div>
        )}

        {query && !searching && !hasResults && debouncedQuery === query && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState query={query} />
          </motion.div>
        )}

        {query && !searching && hasResults && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
            <p className="text-white/30 text-sm">
              {totalResults.toLocaleString()} results for <span className="text-white/60 font-medium">"{debouncedQuery}"</span>
            </p>

            {(filter === "all" || filter === "movie") && movies.length > 0 && (
              <section>
                <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <Film size={15} className="text-[var(--color-accent)]" /> Movies <span className="text-white/30 text-sm font-normal">({movies.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <MediaCard item={item} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {(filter === "all" || filter === "tv") && tv.length > 0 && (
              <section>
                <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <Tv size={15} className="text-[var(--color-accent)]" /> TV Shows <span className="text-white/30 text-sm font-normal">({tv.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tv.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <MediaCard item={item} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {(filter === "all" || filter === "person") && people.length > 0 && (
              <section>
                <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <User size={15} className="text-[var(--color-accent)]" /> People <span className="text-white/30 text-sm font-normal">({people.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {people.map((item) => <PersonCard key={item.id} item={item} />)}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
