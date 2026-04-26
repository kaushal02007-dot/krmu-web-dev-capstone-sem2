import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Check, Star, Play } from "lucide-react";
import { getImageUrl } from "../api/tmdb";
import { useWatchlist } from "../context/WatchlistContext";

export default function MediaCard({ item, size = "md" }) {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!item) return null;

  const title = item.title || item.name || "";
  const poster = item.poster_path;
  const rating = item.vote_average?.toFixed(1);
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const inList = isInWatchlist(item.id);

  const widths = { sm: "w-32", md: "w-40", lg: "w-48" };
  const heights = { sm: "h-48", md: "h-60", lg: "h-72" };

  return (
    <motion.div
      className={`media-card relative flex-shrink-0 ${widths[size]} cursor-pointer group`}
      onClick={() => navigate(`/${mediaType}/${item.id}`)}
      whileHover="hovered"
    >
      {/* Poster */}
      <div className={`relative ${heights[size]} rounded-xl overflow-hidden bg-white/5`}>
        {/* Skeleton shimmer */}
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer rounded-xl" />
        )}

        {poster ? (
          <img
            src={getImageUrl(poster, "w342")}
            alt={title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-white/20 text-xs text-center px-2">{title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          variants={{ hovered: { opacity: 1 }, default: { opacity: 0 } }}
          initial="default"
          className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 rounded-xl"
        >
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="play-btn w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/${mediaType}/${item.id}`);
            }}
          >
            <Play size={20} fill="black" className="text-black ml-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`watchlist-btn w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              inList
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-black"
                : "border-white/40 text-white hover:border-[var(--color-accent)]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(item);
            }}
          >
            {inList ? <Check size={14} /> : <Plus size={14} />}
          </motion.button>
        </motion.div>

        {/* Rating badge */}
        {rating && parseFloat(rating) > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Star size={9} className="text-yellow-400" fill="currentColor" />
            <span className="text-white text-xs font-bold">{rating}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <p className="text-white/90 text-xs font-medium leading-tight line-clamp-2">{title}</p>
        {year && <p className="text-white/40 text-xs mt-0.5">{year}</p>}
      </div>
    </motion.div>
  );
}
