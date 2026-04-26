import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, Trash2, Search, SlidersHorizontal,
  Film, Tv, Star, Calendar, ArrowUpDown, X, Play
} from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { getImageUrl } from "../api/tmdb";

// ─── Empty State ────────────────────────────────────────────
function EmptyState({ filtered }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      style={emptyWrapStyle}
    >
      <div style={emptyIconStyle}>
        <Bookmark size={32} style={{ color: "var(--color-accent)", opacity: 0.7 }} />
      </div>
      <h3 style={emptyTitleStyle}>
        {filtered ? "No matches found" : "Your watchlist is empty"}
      </h3>
      <p style={emptySubStyle}>
        {filtered
          ? "Try adjusting your filters or search query."
          : "Add movies and TV shows to keep track of what you want to watch."}
      </p>
      {!filtered && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/home")}
          style={emptyBtnStyle}
        >
          Browse Content
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Watchlist Card ─────────────────────────────────────────
function WatchlistCard({ item, onRemove, view }) {
  const navigate = useNavigate();
  const type     = item.media_type || "movie";
  const title    = item.title || item.name || "Untitled";
  const year     = (item.release_date || item.first_air_date || "").slice(0, 4);
  const rating   = item.vote_average?.toFixed(1) || "N/A";
  const poster   = getImageUrl(item.poster_path, "w342");
  const overview = item.overview || "";

  const goToDetail = () => navigate(`/${type}/${item.id}`);

  if (view === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        style={listCardStyle}
      >
        {/* Poster */}
        <div style={listPosterStyle} onClick={goToDetail}>
          {poster ? (
            <img src={poster} alt={title} style={listPosterImgStyle} />
          ) : (
            <div style={posterFallbackStyle}>{title[0]}</div>
          )}
          <div style={listPosterOverlayStyle}>
            <Play size={20} fill="white" color="white" />
          </div>
        </div>

        {/* Info */}
        <div style={listInfoStyle}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={listTitleStyle} onClick={goToDetail}>{title}</h3>
              <div style={listMetaStyle}>
                <span style={typeBadgeStyle(type)}>
                  {type === "tv" ? <Tv size={10} /> : <Film size={10} />}
                  {type === "tv" ? "TV" : "Movie"}
                </span>
                {year && <span style={metaTextStyle}>{year}</span>}
                <span style={ratingStyle}>
                  <Star size={10} fill="currentColor" />
                  {rating}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(item.id, type)}
              style={removeBtn}
              title="Remove"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
          <p style={listOverviewStyle}>{overview}</p>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      whileHover="hover"
      style={gridCardStyle}
    >
      {/* Poster */}
      <div style={gridPosterWrapStyle} onClick={goToDetail}>
        {poster ? (
          <motion.img
            src={poster}
            alt={title}
            style={gridPosterImgStyle}
            variants={{ hover: { scale: 1.06 } }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div style={posterFallbackStyle}>{title[0]}</div>
        )}

        {/* Hover overlay */}
        <motion.div
          style={gridOverlayStyle}
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            style={playCircleStyle}
            variants={{ hover: { scale: 1 } }}
            initial={{ scale: 0.7 }}
          >
            <Play size={18} fill="white" color="white" />
          </motion.div>
        </motion.div>

        {/* Remove button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id, type); }}
          style={gridRemoveBtnStyle}
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          title="Remove"
        >
          <X size={12} />
        </motion.button>

        {/* Type badge */}
        <div style={gridTypeBadgeStyle(type)}>
          {type === "tv" ? <Tv size={9} /> : <Film size={9} />}
          {type === "tv" ? "TV" : "Movie"}
        </div>
      </div>

      {/* Info */}
      <div style={gridInfoStyle}>
        <p style={gridTitleStyle}>{title}</p>
        <div style={gridMetaStyle}>
          {year && <span style={metaTextStyle}>{year}</span>}
          <span style={ratingStyle}>
            <Star size={9} fill="currentColor" />
            {rating}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function Watchlist() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();

  const [view,      setView]      = useState("grid");   // "grid" | "list"
  const [filter,    setFilter]    = useState("all");    // "all" | "movie" | "tv"
  const [sortBy,    setSortBy]    = useState("added");  // "added" | "rating" | "title" | "year"
  const [search,    setSearch]    = useState("");
  const [showSort,  setShowSort]  = useState(false);

  const filtered = useMemo(() => {
    let list = [...watchlist];

    // Type filter
    if (filter !== "all") list = list.filter(i => (i.media_type || "movie") === filter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => (i.title || i.name || "").toLowerCase().includes(q));
    }

    // Sort
    switch (sortBy) {
      case "rating":
        list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)); break;
      case "title":
        list.sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || "")); break;
      case "year":
        list.sort((a, b) => {
          const ya = (a.release_date || a.first_air_date || "").slice(0, 4);
          const yb = (b.release_date || b.first_air_date || "").slice(0, 4);
          return yb.localeCompare(ya);
        }); break;
      case "added":
      default:
        list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)); break;
    }

    return list;
  }, [watchlist, filter, search, sortBy]);

  const movieCount = watchlist.filter(i => (i.media_type || "movie") === "movie").length;
  const tvCount    = watchlist.filter(i => i.media_type === "tv").length;

  const SORT_OPTIONS = [
    { value: "added",  label: "Date Added",  icon: Calendar },
    { value: "rating", label: "Top Rated",   icon: Star },
    { value: "title",  label: "A → Z",       icon: ArrowUpDown },
    { value: "year",   label: "Newest First", icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={pageStyle}
    >
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div>
          <h1 style={pageTitleStyle}>
            <Bookmark size={28} style={{ color: "var(--color-accent)" }} />
            My Watchlist
          </h1>
          <p style={pageSubStyle}>
            {watchlist.length === 0
              ? "Nothing saved yet"
              : `${watchlist.length} title${watchlist.length !== 1 ? "s" : ""} · ${movieCount} movie${movieCount !== 1 ? "s" : ""} · ${tvCount} show${tvCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {watchlist.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={clearWatchlist}
            style={clearBtnStyle}
          >
            <Trash2 size={14} /> Clear All
          </motion.button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <EmptyState filtered={false} />
      ) : (
        <>
          {/* ── Controls ── */}
          <div style={controlsStyle}>

            {/* Search */}
            <div style={searchWrapStyle}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search your watchlist…"
                style={searchInputStyle}
              />
              {search && (
                <button onClick={() => setSearch("")} style={clearSearchBtn}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Type filter tabs */}
            <div style={tabsStyle}>
              {[
                { value: "all",   label: "All",    count: watchlist.length },
                { value: "movie", label: "Movies", count: movieCount },
                { value: "tv",    label: "TV",     count: tvCount },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  style={tabStyle(filter === tab.value)}
                >
                  {tab.label}
                  <span style={tabCountStyle(filter === tab.value)}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Sort + View toggle */}
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>

              {/* Sort dropdown */}
              <div style={{ position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setShowSort(v => !v)}
                  style={iconBtnStyle}
                >
                  <SlidersHorizontal size={15} />
                  <span style={{ fontSize: "12px" }}>
                    {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                  </span>
                </motion.button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      style={sortDropdownStyle}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                          style={sortOptionStyle(sortBy === opt.value)}
                        >
                          <opt.icon size={13} />
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid / List toggle */}
              <div style={viewToggleStyle}>
                {["grid", "list"].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={viewToggleBtnStyle(view === v)}
                    title={v === "grid" ? "Grid view" : "List view"}
                  >
                    {v === "grid" ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <rect x="0" y="0" width="6" height="6" rx="1.5" />
                        <rect x="8" y="0" width="6" height="6" rx="1.5" />
                        <rect x="0" y="8" width="6" height="6" rx="1.5" />
                        <rect x="8" y="8" width="6" height="6" rx="1.5" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <rect x="0" y="1" width="14" height="3" rx="1.5" />
                        <rect x="0" y="6" width="14" height="3" rx="1.5" />
                        <rect x="0" y="11" width="14" height="3" rx="1.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Results count ── */}
          {(search || filter !== "all") && (
            <p style={resultCountStyle}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {search && ` for "${search}"`}
            </p>
          )}

          {/* ── Grid / List ── */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <EmptyState filtered />
            ) : view === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={gridStyle}
              >
                <AnimatePresence>
                  {filtered.map(item => (
                    <WatchlistCard
                      key={`${item.id}-${item.media_type}`}
                      item={item}
                      view="grid"
                      onRemove={removeFromWatchlist}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={listStyle}
              >
                <AnimatePresence>
                  {filtered.map(item => (
                    <WatchlistCard
                      key={`${item.id}-${item.media_type}`}
                      item={item}
                      view="list"
                      onRemove={removeFromWatchlist}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const pageStyle = {
  minHeight: "100vh",
  padding: "100px 64px 80px",
  maxWidth: "1400px",
  margin: "0 auto",
};
const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: "36px",
  gap: "16px",
};
const pageTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
  fontWeight: 800,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "6px",
};
const pageSubStyle = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.4)",
  marginLeft: "40px",
};
const clearBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 16px",
  borderRadius: "10px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.2)",
  color: "#f87171",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
};
const controlsStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  marginBottom: "28px",
  padding: "16px 20px",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
};
const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  flex: "1",
  minWidth: "180px",
  maxWidth: "280px",
};
const searchInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: "13px",
  color: "#fff",
  fontFamily: "var(--font-body)",
};
const clearSearchBtn = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.3)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
const tabsStyle = {
  display: "flex",
  gap: "4px",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "10px",
  padding: "3px",
};
const tabStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  background: active ? "var(--color-accent)" : "transparent",
  color: active ? "var(--color-surface)" : "rgba(255,255,255,0.5)",
  transition: "all 200ms",
});
const tabCountStyle = (active) => ({
  fontSize: "11px",
  fontWeight: 700,
  padding: "1px 6px",
  borderRadius: "99px",
  background: active ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.08)",
  color: active ? "var(--color-surface)" : "rgba(255,255,255,0.4)",
});
const iconBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 12px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.7)",
  fontSize: "13px",
  cursor: "pointer",
};
const sortDropdownStyle = {
  position: "absolute",
  top: "calc(100% + 6px)",
  right: 0,
  background: "#1a1f35",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "6px",
  zIndex: 50,
  minWidth: "160px",
  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
};
const sortOptionStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: active ? 600 : 400,
  cursor: "pointer",
  border: "none",
  background: active ? "var(--color-accent-muted)" : "transparent",
  color: active ? "var(--color-accent)" : "rgba(255,255,255,0.6)",
  textAlign: "left",
});
const viewToggleStyle = {
  display: "flex",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "10px",
  padding: "3px",
  gap: "2px",
};
const viewToggleBtnStyle = (active) => ({
  padding: "7px 10px",
  borderRadius: "7px",
  border: "none",
  cursor: "pointer",
  background: active ? "rgba(255,255,255,0.1)" : "transparent",
  color: active ? "#fff" : "rgba(255,255,255,0.35)",
  display: "flex",
  alignItems: "center",
  transition: "all 150ms",
});
const resultCountStyle = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.35)",
  marginBottom: "16px",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: "20px",
};
const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

// ── Card styles ──
const gridCardStyle = {
  cursor: "pointer",
  borderRadius: "12px",
  overflow: "visible",
};
const gridPosterWrapStyle = {
  position: "relative",
  borderRadius: "12px",
  overflow: "hidden",
  aspectRatio: "2/3",
  background: "rgba(255,255,255,0.04)",
  cursor: "pointer",
};
const gridPosterImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const gridOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const playCircleStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "var(--color-accent)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const gridRemoveBtnStyle = {
  position: "absolute",
  top: "8px",
  right: "8px",
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  background: "rgba(239,68,68,0.85)",
  border: "none",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 2,
};
const gridTypeBadgeStyle = (type) => ({
  position: "absolute",
  bottom: "8px",
  left: "8px",
  display: "flex",
  alignItems: "center",
  gap: "3px",
  padding: "3px 7px",
  borderRadius: "99px",
  fontSize: "9px",
  fontWeight: 700,
  background: type === "tv" ? "rgba(124,106,255,0.85)" : "rgba(0,229,255,0.85)",
  color: "#000",
  backdropFilter: "blur(4px)",
});
const gridInfoStyle = {
  padding: "10px 4px 4px",
};
const gridTitleStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#fff",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  marginBottom: "4px",
};
const gridMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

// List card
const listCardStyle = {
  display: "flex",
  gap: "16px",
  padding: "14px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "14px",
  alignItems: "flex-start",
  transition: "background 200ms",
};
const listPosterStyle = {
  flexShrink: 0,
  width: "64px",
  height: "96px",
  borderRadius: "8px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.05)",
  cursor: "pointer",
  position: "relative",
};
const listPosterImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};
const listPosterOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "all 200ms",
};
const listInfoStyle = { flex: 1, minWidth: 0 };
const listTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "15px",
  fontWeight: 700,
  color: "#fff",
  cursor: "pointer",
  marginBottom: "6px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};
const listMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
};
const listOverviewStyle = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.4)",
  lineHeight: 1.6,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};
const typeBadgeStyle = (type) => ({
  display: "flex",
  alignItems: "center",
  gap: "3px",
  padding: "2px 7px",
  borderRadius: "99px",
  fontSize: "10px",
  fontWeight: 700,
  background: type === "tv" ? "rgba(124,106,255,0.2)" : "rgba(0,229,255,0.15)",
  color: type === "tv" ? "#a78bfa" : "var(--color-accent)",
});
const metaTextStyle = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.35)",
};
const ratingStyle = {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  fontSize: "12px",
  color: "#fbbf24",
  fontWeight: 600,
};
const removeBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.15)",
  color: "#f87171",
  cursor: "pointer",
  flexShrink: 0,
};
const posterFallbackStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.2)",
  fontSize: "24px",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
};

// Empty state
const emptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 24px",
  textAlign: "center",
};
const emptyIconStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "var(--color-accent-muted)",
  border: "1px solid rgba(0,229,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
};
const emptyTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "22px",
  fontWeight: 700,
  color: "#fff",
  marginBottom: "10px",
};
const emptySubStyle = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.4)",
  maxWidth: "320px",
  lineHeight: 1.6,
  marginBottom: "28px",
};
const emptyBtnStyle = {
  padding: "12px 28px",
  borderRadius: "12px",
  background: "var(--color-accent)",
  color: "var(--color-surface)",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 20px var(--color-accent-glow)",
};
