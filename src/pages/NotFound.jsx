import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 20 }}
        className="text-[10rem] leading-none mb-4 select-none"
      >🎬</motion.div>
      <h1 className="text-white text-5xl font-black mb-3 tracking-tight">404</h1>
      <p className="text-white/40 text-lg mb-2">Scene not found</p>
      <p className="text-white/25 text-sm mb-10 max-w-xs">
        The page you're looking for got cut from the final edit.
      </p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")} className="btn-hero-primary">
          <Home size={16} /> Go Home
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/discover")} className="btn-hero-secondary">
          <Compass size={16} /> Discover
        </motion.button>
      </div>
    </motion.div>
  );
}
