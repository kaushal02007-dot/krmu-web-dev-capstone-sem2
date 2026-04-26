import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Play, Plus, Check, Star, Clock, Calendar, Globe,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { fetchDetails, getImageUrl, getTrailer } from "../api/tmdb";
import { useWatchlist } from "../context/WatchlistContext";
import { useTheme } from "../context/ThemeContext";
import MediaCard from "../components/MediaCard";
import CardSkeleton from "../components/CardSkeleton";

// ─── Trailer Modal ──────────────────────────────────────────
function TrailerModal({ videoKey, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!videoKey) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={overlayStyle}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          style={modalStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title="Trailer"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
          <button onClick={onClose} style={closeBtn}>
            <X size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Cast Row ───────────────────────────────────────────────
function CastRow({ cast = [] }) {
  const rowRef = useRef(null);
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  if (!cast.length) return null;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => scroll(-1)} style={{ ...arrowBtn, left: 0 }}><ChevronLeft size={18} /></button>
      <div ref={rowRef} style={castRowStyle}>
        {cast.slice(0, 20).map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={castCardStyle}
          >
            <div style={castAvatarStyle}>
              {person.profile_path ? (
                <img
                  src={getImageUrl(person.profile_path, "w185")}
                  alt={person.name}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={castAvatarFallback}>{person.name?.[0]}</div>
              )}
            </div>
            <p style={castNameStyle}>{person.name}</p>
            <p style={castCharStyle}>{person.character}</p>
          </motion.div>
        ))}
      </div>
      <button onClick={() => scroll(1)} style={{ ...arrowBtn, right: 0 }}><ChevronRight size={18} /></button>
    </div>
  );
}

// ─── Section Title ──────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <h3 style={sectionTitleStyle}>
      <span style={sectionBarStyle} />
      {children}
    </h3>
  );
}

// ─── Stat Row ───────────────────────────────────────────────
function StatRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={statRowStyle}>
      <span style={statLabelStyle}>{label}</span>
      <span style={statValueStyle}>{value}</span>
    </div>
  );
}

// ─── Main Detail Page ───────────────────────────────────────
export default function Detail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Derive media type from the URL path — not from params
  const mediaType = location.pathname.startsWith("/tv") ? "tv" : "movie";

  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { applyTheme } = useTheme();

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [imgReady, setImgReady]   = useState(false);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const backdropY       = useTransform(scrollY, [0, 500], [0, 100]);
  const backdropOpacity = useTransform(scrollY, [0, 400], [1, 0.25]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    setImgReady(false);
    window.scrollTo(0, 0);

    fetchDetails(mediaType, id)
      .then((d) => {
        setData(d);
        // Apply dynamic theme from poster
        if (d.poster_path) {
          applyTheme?.(getImageUrl(d.poster_path, "w500"));
        }
      })
      .catch((err) => {
        console.error("[Detail] fetch failed:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [mediaType, id]);

  if (loading) return <DetailSkeleton />;

  if (error || !data) return (
    <div style={errorStyle}>
      <p style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</p>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
        {error || "Could not load details."}
      </p>
      <button
        onClick={() => navigate(-1)}
        style={backBtnStyle}
      >
        ← Go Back
      </button>
    </div>
  );

  // ── Derived data ────────────────────────────────────────────
  const title       = data.title || data.name || "";
  const tagline     = data.tagline || "";
  const overview    = data.overview || "";
  const rating      = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
  const voteCount   = data.vote_count?.toLocaleString() || "0";
  const runtime     = data.runtime
    ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`
    : data.episode_run_time?.[0]
    ? `${data.episode_run_time[0]}m / ep`
    : null;
  const releaseDate = data.release_date || data.first_air_date || "";
  const year        = releaseDate.slice(0, 4);
  const genres      = data.genres || [];
  const cast        = data.credits?.cast || [];
  const videos      = data.videos?.results || [];
  const trailer     = getTrailer(videos);
  const seasons     = data.seasons?.filter(s => s.season_number > 0) || [];
  const inList      = isInWatchlist(data.id, mediaType);

  const recommendations = [
    ...(data.recommendations?.results || []),
    ...(data.similar?.results || []),
  ]
    .filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i)
    .slice(0, 12);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", background: "var(--color-surface)" }}
    >
      {/* ── Hero backdrop ── */}
      <div ref={heroRef} style={heroWrapStyle}>
        <motion.div style={{ y: backdropY, opacity: backdropOpacity, position: "absolute", inset: 0, scale: 1.08 }}>
          {data.backdrop_path && (
            <img
              src={getImageUrl(data.backdrop_path, "original")}
              alt=""
              onLoad={() => setImgReady(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover", objectPosition: "top",
                opacity: imgReady ? 1 : 0, transition: "opacity 0.7s ease",
              }}
            />
          )}
        </motion.div>

        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,11,20,0.97) 30%, rgba(8,11,20,0.6) 65%, rgba(8,11,20,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--color-surface) 0%, transparent 40%)" }} />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          style={backButtonStyle}
        >
          <ChevronLeft size={18} /> Back
        </motion.button>

        {/* Hero content */}
        <div style={heroContentStyle}>
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={posterWrapStyle}
          >
            {data.poster_path ? (
              <img
                src={getImageUrl(data.poster_path, "w342")}
                alt={title}
                style={posterImgStyle}
              />
            ) : (
              <div style={posterFallbackStyle}>{title}</div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ flex: 1, minWidth: 0 }}
          >
            {tagline && <p style={taglineStyle}>{tagline}</p>}

            <h1 style={titleStyle}>{title}</h1>

            {/* Meta row */}
            <div style={metaRowStyle}>
              <span style={ratingStyle}>
                <Star size={13} fill="currentColor" style={{ display: "inline", marginRight: 4 }} />
                {rating}
                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "12px", marginLeft: 4 }}>
                  ({voteCount})
                </span>
              </span>
              {year && <span style={metaChipStyle}>{year}</span>}
              {runtime && <span style={metaChipStyle}>{runtime}</span>}
              <span style={metaChipStyle}>{mediaType === "tv" ? "TV Series" : "Movie"}</span>
            </div>

            {/* Genres */}
            <div style={genreRowStyle}>
              {genres.map(g => (
                <span key={g.id} style={genreTagStyle}>{g.name}</span>
              ))}
            </div>

            {/* Action buttons */}
            <div style={actionRowStyle}>
              {/* Watch Trailer button — only shown if trailer exists */}
              {trailer ? (
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 32px var(--color-accent-glow)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowTrailer(true)}
                  style={watchBtnStyle}
                >
                  <Play size={16} fill="currentColor" />
                  Watch Trailer
                </motion.button>
              ) : (
                // No trailer available — show disabled state
                <div style={noBtnStyle}>
                  <Play size={16} />
                  No Trailer Available
                </div>
              )}

              {/* Watchlist toggle */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleWatchlist({ ...data, media_type: mediaType })}
                style={inList ? watchlistBtnActiveStyle : watchlistBtnStyle}
              >
                {inList ? <Check size={16} /> : <Plus size={16} />}
                {inList ? "In Watchlist" : "Add to Watchlist"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={bodyStyle}>
        <div style={gridStyle}>

          {/* Left — main content */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "48px" }}>

            {/* Overview */}
            {overview && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle>Overview</SectionTitle>
                <p style={overviewStyle}>{overview}</p>
              </motion.section>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle>Cast</SectionTitle>
                <CastRow cast={cast} />
              </motion.section>
            )}

            {/* Seasons (TV only) */}
            {seasons.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <SectionTitle>Seasons</SectionTitle>
                <div style={seasonsGridStyle}>
                  {seasons.map(s => (
                    <div key={s.id} style={seasonCardStyle}>
                      {s.poster_path ? (
                        <img
                          src={getImageUrl(s.poster_path, "w185")}
                          alt={s.name}
                          style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={seasonFallbackStyle}>{s.name}</div>
                      )}
                      <div style={{ padding: "8px" }}>
                        <p style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>{s.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{s.episode_count} eps</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <SectionTitle>You Might Also Like</SectionTitle>
                <div style={{ overflowX: "auto", marginLeft: "-8px", marginRight: "-8px" }}>
                  <div style={{ display: "flex", gap: "16px", padding: "8px", width: "max-content" }}>
                    {recommendations.map(item => (
                      <MediaCard
                        key={item.id}
                        item={{ ...item, media_type: item.media_type || mediaType }}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Right — sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            style={sidebarStyle}
          >
            <h3 style={sidebarTitleStyle}>Details</h3>
            <StatRow label="Rating"   value={`${rating} / 10`} />
            <StatRow label={mediaType === "tv" ? "First Aired" : "Release"} value={releaseDate} />
            <StatRow label="Runtime"  value={runtime} />
            <StatRow label="Language" value={data.original_language?.toUpperCase()} />
            <StatRow label="Status"   value={data.status} />
            {data.budget > 0 && <StatRow label="Budget"  value={`$${(data.budget / 1e6).toFixed(0)}M`} />}
            {data.revenue > 0 && <StatRow label="Revenue" value={`$${(data.revenue / 1e6).toFixed(0)}M`} />}

            {data.production_companies?.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "8px" }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "8px" }}>Production</p>
                {data.production_companies.slice(0, 3).map(c => (
                  <p key={c.id} style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", marginBottom: "4px" }}>{c.name}</p>
                ))}
              </div>
            )}

            {/* Videos list */}
            {videos.length > 0 && (
              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <p style={sidebarTitleStyle}>Videos</p>
                {videos.slice(0, 6).map(v => (
                  <button
                    key={v.key}
                    onClick={() => {
                      // Only open if we have a valid YouTube key
                      if (v.key && v.site === "YouTube") setShowTrailer(true);
                    }}
                    style={videoItemStyle}
                  >
                    <Play size={11} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* Trailer modal */}
      {showTrailer && trailer && (
        <TrailerModal videoKey={trailer.key} onClose={() => setShowTrailer(false)} />
      )}
    </motion.div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ ...heroWrapStyle, background: "var(--color-surface-raised)" }}>
        <div style={{ position: "absolute", inset: 0 }} className="shimmer" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,11,20,0.9) 40%, transparent)" }} />
        <div style={heroContentStyle}>
          <div style={{ ...posterWrapStyle, background: "rgba(255,255,255,0.05)" }} className="shimmer" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ height: "12px", width: "120px", borderRadius: "6px", opacity: 0.3 }} className="shimmer" />
            <div style={{ height: "48px", width: "320px", borderRadius: "10px", opacity: 0.4 }} className="shimmer" />
            <div style={{ height: "14px", width: "200px", borderRadius: "6px", opacity: 0.3 }} className="shimmer" />
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <div style={{ height: "44px", width: "160px", borderRadius: "12px", opacity: 0.4 }} className="shimmer" />
              <div style={{ height: "44px", width: "160px", borderRadius: "12px", opacity: 0.3 }} className="shimmer" />
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "40px 64px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {[90, 80, 70, 60].map((w, i) => (
          <div key={i} style={{ height: "12px", width: `${w}%`, borderRadius: "6px", opacity: 0.2 }} className="shimmer" />
        ))}
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const heroWrapStyle = {
  position: "relative",
  height: "82vh",
  minHeight: "520px",
  overflow: "hidden",
};
const heroContentStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "0 64px 48px",
  display: "flex",
  gap: "32px",
  alignItems: "flex-end",
};
const posterWrapStyle = {
  flexShrink: 0,
  width: "160px",
  height: "240px",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
  border: "1px solid rgba(255,255,255,0.1)",
};
const posterImgStyle = { width: "100%", height: "100%", objectFit: "cover" };
const posterFallbackStyle = {
  width: "100%", height: "100%",
  background: "rgba(255,255,255,0.05)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "rgba(255,255,255,0.2)", fontSize: "12px", padding: "12px", textAlign: "center",
};
const taglineStyle = {
  color: "var(--color-accent)",
  fontSize: "13px",
  fontStyle: "italic",
  marginBottom: "8px",
  opacity: 0.85,
};
const titleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(2rem, 5vw, 3.5rem)",
  fontWeight: 800,
  color: "#fff",
  lineHeight: 1.1,
  letterSpacing: "-1px",
  marginBottom: "12px",
};
const metaRowStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "12px",
};
const ratingStyle = {
  display: "flex",
  alignItems: "center",
  color: "#fbbf24",
  fontWeight: 700,
  fontSize: "14px",
};
const metaChipStyle = {
  color: "rgba(255,255,255,0.4)",
  fontSize: "13px",
};
const genreRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "20px",
};
const genreTagStyle = {
  padding: "4px 12px",
  borderRadius: "99px",
  fontSize: "12px",
  fontWeight: 500,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.7)",
};
const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};
const watchBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "12px",
  background: "var(--color-accent)",
  color: "var(--color-surface)",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 24px var(--color-accent-glow)",
};
const noBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.3)",
  fontSize: "14px",
  cursor: "not-allowed",
  border: "1px solid rgba(255,255,255,0.06)",
};
const watchlistBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: "14px",
  cursor: "pointer",
};
const watchlistBtnActiveStyle = {
  ...watchlistBtnStyle,
  background: "rgba(0,229,255,0.12)",
  border: "1px solid rgba(0,229,255,0.3)",
  color: "var(--color-accent)",
};
const backButtonStyle = {
  position: "absolute",
  top: "88px",
  left: "64px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: "rgba(255,255,255,0.6)",
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "99px",
  padding: "6px 14px 6px 10px",
  fontSize: "13px",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  zIndex: 10,
};
const bodyStyle = {
  padding: "48px 64px 80px",
  maxWidth: "1400px",
  margin: "0 auto",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 320px",
  gap: "48px",
};
const overviewStyle = {
  color: "rgba(255,255,255,0.7)",
  lineHeight: 1.8,
  fontSize: "15px",
};
const sectionTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontFamily: "var(--font-display)",
  fontSize: "16px",
  fontWeight: 700,
  color: "#fff",
  marginBottom: "20px",
};
const sectionBarStyle = {
  width: "3px",
  height: "18px",
  borderRadius: "99px",
  background: "var(--color-accent)",
  display: "inline-block",
  flexShrink: 0,
};
const sidebarStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "20px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignSelf: "start",
  position: "sticky",
  top: "88px",
};
const sidebarTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "14px",
  fontWeight: 700,
  color: "#fff",
  marginBottom: "4px",
};
const statRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
const statLabelStyle = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.35)",
};
const statValueStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.85)",
};
const videoItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  background: "none",
  border: "none",
  padding: "6px 8px",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 150ms",
};
const seasonsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
  gap: "12px",
};
const seasonCardStyle = {
  borderRadius: "10px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
};
const seasonFallbackStyle = {
  width: "100%",
  aspectRatio: "2/3",
  background: "rgba(255,255,255,0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.2)",
  fontSize: "11px",
  padding: "8px",
  textAlign: "center",
};
const castRowStyle = {
  display: "flex",
  gap: "16px",
  overflowX: "auto",
  padding: "8px 4px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};
const castCardStyle = {
  flexShrink: 0,
  width: "88px",
  textAlign: "center",
};
const castAvatarStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  overflow: "hidden",
  background: "rgba(255,255,255,0.06)",
  margin: "0 auto 8px",
  border: "2px solid rgba(255,255,255,0.08)",
};
const castAvatarFallback = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.2)",
  fontSize: "22px",
};
const castNameStyle = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#fff",
  lineHeight: 1.3,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};
const castCharStyle = {
  fontSize: "10px",
  color: "rgba(255,255,255,0.35)",
  marginTop: "2px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};
const arrowBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  background: "rgba(0,0,0,0.6)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};
const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  background: "rgba(0,0,0,0.85)",
  backdropFilter: "blur(8px)",
};
const modalStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "900px",
  aspectRatio: "16/9",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
};
const closeBtn = {
  position: "absolute",
  top: "12px",
  right: "12px",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.7)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 10,
};
const errorStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.5)",
  textAlign: "center",
};
const backBtnStyle = {
  marginTop: "16px",
  padding: "10px 24px",
  borderRadius: "10px",
  background: "var(--color-accent)",
  color: "var(--color-surface)",
  fontWeight: 700,
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
};
