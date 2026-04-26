import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Bookmark, User, Menu, Compass,
  Zap, Home, LogIn
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";

// ── Main Navbar ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: "/home",         label: "Home",     icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/mood",     label: "Mood",     icon: Zap },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { watchlist } = useWatchlist();

  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll shrink
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ── THE FIX: clicking search icon goes straight to /search ──
  const openSearch = () => navigate("/search");

  return (
    <>
      <motion.nav
        className={`navbar fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}
      >
        <div className="navbar-inner max-w-screen-2xl mx-auto px-6 md:px-12 flex items-center h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="navbar-logo flex-shrink-0 text-xl font-black tracking-tight">
            Trang<span className="text-[var(--color-accent)]">Mix</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`navbar-link px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === to ? "active" : ""}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Search icon — navigates directly to /search */}
            <motion.button
              onClick={openSearch}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="navbar-icon-btn w-9 h-9 rounded-xl flex items-center justify-center"
            >
              <Search size={17} />
            </motion.button>

            {/* Watchlist */}
            {user && (
              <Link to="/watchlist">
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                  className="navbar-icon-btn relative w-9 h-9 rounded-xl flex items-center justify-center">
                  <Bookmark size={17} />
                  {watchlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center"
                      style={{ background: "var(--color-accent)", color: "black" }}>
                      {watchlist.length > 9 ? "9+" : watchlist.length}
                    </span>
                  )}
                </motion.div>
              </Link>
            )}

            {/* Profile / Login */}
            {user ? (
              <Link to="/profile">
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-black"
                  style={{ background: "var(--color-accent)" }}>
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </motion.div>
              </Link>
            ) : (
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                  className="navbar-icon-btn w-9 h-9 rounded-xl flex items-center justify-center">
                  <LogIn size={17} />
                </motion.div>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden navbar-icon-btn w-9 h-9 rounded-xl flex items-center justify-center">
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-64 z-40 md:hidden mobile-drawer flex flex-col pt-20 pb-8 px-5"
            >
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`mobile-nav-link flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 text-sm font-semibold transition-colors ${location.pathname === to ? "active" : ""}`}>
                  <Icon size={16} />{label}
                </Link>
              ))}

              {/* Mobile search link */}
              <button onClick={openSearch}
                className="mobile-nav-link flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 text-sm font-semibold transition-colors text-left">
                <Search size={16} /> Search
              </button>

              <div className="mt-auto space-y-1">
                {user ? (
                  <>
                    <Link to="/watchlist" className="mobile-nav-link flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold">
                      <Bookmark size={16} /> Watchlist {watchlist.length > 0 && `(${watchlist.length})`}
                    </Link>
                    <Link to="/profile" className="mobile-nav-link flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold">
                      <User size={16} /> Profile
                    </Link>
                  </>
                ) : (
                  <Link to="/login" className="mobile-nav-link flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold">
                    <LogIn size={16} /> Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
