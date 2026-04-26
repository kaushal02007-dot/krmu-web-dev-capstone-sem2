import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <motion.div
      className="page-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated ring */}
      <div className="loader-ring" aria-hidden="true">
        <svg viewBox="0 0 50 50" className="loader-svg">
          <circle
            className="loader-track"
            cx="25" cy="25" r="20"
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="loader-arc"
            cx="25" cy="25" r="20"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="loader-label">Loading…</span>
    </motion.div>
  );
}
