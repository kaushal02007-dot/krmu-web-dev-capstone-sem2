import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, LogOut, Film, Tv, Star, Bookmark,
  ChevronRight, Palette, Moon, Bell, Shield, Edit3, Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import { useTheme } from "../context/ThemeContext";
import { getImageUrl } from "../api/tmdb";

// ─── Accent Color Picker ───────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#22c55e", // green
  "#3b82f6", // blue
  "#ec4899", // pink
  "#14b8a6", // teal
];

function AccentPicker({ current, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ACCENT_PRESETS.map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(color)}
          className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-transparent transition-all"
          style={{
            background: color,
            ringColor: current === color ? color : "transparent",
            outline: current === color ? `2px solid ${color}` : "2px solid transparent",
            outlineOffset: "2px",
          }}
        >
          {current === color && <Check size={13} className="text-black font-black" />}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="profile-stat-card flex flex-col items-center justify-center p-5 rounded-2xl bg-white/4 ring-1 ring-white/8 text-center gap-2">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-white text-2xl font-black">{value}</span>
      <span className="text-white/40 text-xs">{label}</span>
    </div>
  );
}

// ─── Settings Row ──────────────────────────────────────────────────────────────
function SettingsRow({ icon: Icon, label, children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-colors ${onClick ? "cursor-pointer hover:bg-white/6" : ""}`}
    >
      <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-white/60" />
      </div>
      <span className="flex-1 text-white/80 text-sm font-medium">{label}</span>
      {children || (onClick && <ChevronRight size={14} className="text-white/25" />)}
    </div>
  );
}

// ─── Recent Watchlist Preview ──────────────────────────────────────────────────
function RecentWatchlist({ items }) {
  const navigate = useNavigate();
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-sm">Recently Saved</span>
        <button onClick={() => navigate("/watchlist")} className="text-[var(--color-accent)] text-xs">See all</button>
      </div>
      <div className="flex gap-2">
        {items.slice(0, 6).map((item) => (
          <motion.div key={item.id} whileHover={{ scale: 1.05, y: -3 }}
            onClick={() => navigate(`/${item.media_type || "movie"}/${item.id}`)}
            className="w-14 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 bg-white/5">
            {item.poster_path ? (
              <img src={getImageUrl(item.poster_path, "w92")} alt="" className="w-full h-full object-cover" />
            ) : <div className="w-full h-full bg-white/5" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Profile Page ─────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const { watchlist }    = useWatchlist();
  const { accentColor, setAccent } = useTheme();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || user?.email?.split("@")[0] || "User");
  const [tempName, setTempName]        = useState(displayName);

  const movieCount = watchlist.filter((i) => !i.first_air_date && i.media_type !== "tv").length;
  const tvCount    = watchlist.filter((i) => i.first_air_date || i.media_type === "tv").length;
  const avgRating  = watchlist.length
    ? (watchlist.reduce((s, i) => s + (i.vote_average || 0), 0) / watchlist.length).toFixed(1)
    : "—";

  const handleLogout = () => { logout(); navigate("/login"); };

  const saveName = () => {
    setDisplayName(tempName || displayName);
    setEditingName(false);
  };

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-20 px-6 md:px-16 max-w-4xl mx-auto">

      {/* ── Avatar + Name ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10">

        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-black text-black ring-4 ring-[var(--color-accent)]/30"
            style={{ background: accentColor }}>
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
            <User size={13} className="text-black" />
          </div>
        </div>

        {/* Name */}
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={tempName} onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  autoFocus
                  className="bg-white/8 text-white text-xl font-black rounded-lg px-3 py-1 outline-none ring-1 ring-[var(--color-accent)]/50 w-44" />
                <button onClick={saveName} className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                  <Check size={14} className="text-black" />
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-white text-2xl font-black">{displayName}</h1>
                <button onClick={() => setEditingName(true)} className="text-white/30 hover:text-white/60 transition-colors">
                  <Edit3 size={14} />
                </button>
              </>
            )}
          </div>
          <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard icon={Bookmark} label="Total Saved"  value={watchlist.length} color={accentColor} />
        <StatCard icon={Film}     label="Movies"       value={movieCount}        color="#f59e0b" />
        <StatCard icon={Tv}       label="TV Shows"     value={tvCount}           color="#8b5cf6" />
        <StatCard icon={Star}     label="Avg Rating"   value={avgRating}         color="#f43f5e" />
      </motion.div>

      {/* ── Recent Watchlist ── */}
      {watchlist.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-10 p-5 rounded-2xl bg-white/4 ring-1 ring-white/8">
          <RecentWatchlist items={watchlist} />
        </motion.div>
      )}

      {/* ── Settings ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="space-y-2">

        {/* Accent color */}
        <div className="rounded-2xl bg-white/4 ring-1 ring-white/8 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center">
                <Palette size={16} className="text-white/60" />
              </div>
              <span className="text-white/80 text-sm font-medium">Accent Color</span>
            </div>
            <AccentPicker current={accentColor} onChange={setAccent} />
          </div>
        </div>

        {/* Other settings */}
        <div className="rounded-2xl bg-white/4 ring-1 ring-white/8 overflow-hidden divide-y divide-white/5">
          <SettingsRow icon={Bell}   label="Notifications" onClick={() => {}} />
          <SettingsRow icon={Shield} label="Privacy"       onClick={() => {}} />
        </div>

        {/* Logout */}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/8 ring-1 ring-red-500/20 text-red-400 hover:bg-red-500/14 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-red-500/12 flex items-center justify-center">
            <LogOut size={16} className="text-red-400" />
          </div>
          <span className="font-medium text-sm">Sign Out</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
