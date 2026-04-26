import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchTrending, getImageUrl } from "../api/tmdb";

// ─── Poster Column ──────────────────────────────────────────
// Each column scrolls at a different speed, some go up, some down
function PosterColumn({ posters, direction = "up", duration = 30, offset = 0 }) {
  if (!posters.length) return null;

  // Duplicate for seamless loop
  const doubled = [...posters, ...posters];

  return (
    <div style={columnWrapStyle}>
      <motion.div
        style={columnInnerStyle}
        animate={{
          y: direction === "up"
            ? [`${offset}%`, `${offset - 50}%`]
            : [`${offset - 50}%`, `${offset}%`],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {doubled.map((src, i) => (
          <div key={i} style={posterItemStyle}>
            <img
              src={src}
              alt=""
              style={posterImgStyle}
              loading="lazy"
              onError={(e) => { e.target.style.opacity = 0; }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Login ──────────────────────────────────────────────
export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || "/home";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [focused,  setFocused]  = useState(null);

  // Poster columns data
  const [columns, setColumns] = useState([[], [], [], [], []]);

  useEffect(() => {
    // Fetch trending to fill poster grid
    fetchTrending("all", "week")
      .then((data) => {
        const results = data?.results || [];
        const posters = results
          .filter((r) => r.poster_path)
          .map((r) => getImageUrl(r.poster_path, "w342"));

        // Pad with repeats if fewer than 20 posters
        while (posters.length < 20) posters.push(...posters);

        // Split into 5 columns of 7 each, staggered
        setColumns([
          posters.slice(0, 7),
          posters.slice(3, 10),
          posters.slice(6, 13),
          posters.slice(9, 16),
          posters.slice(12, 19),
        ]);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate(from === "/login" ? "/home" : from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, pass) => {
    setEmail(email);
    setPassword(pass);
    setError("");
  };

  return (
    <div style={pageStyle}>

      {/* ── Poster grid background ── */}
      <div style={bgStyle}>
        <PosterColumn posters={columns[0]} direction="up"   duration={35} offset={0}   />
        <PosterColumn posters={columns[1]} direction="down" duration={28} offset={-10} />
        <PosterColumn posters={columns[2]} direction="up"   duration={40} offset={-5}  />
        <PosterColumn posters={columns[3]} direction="down" duration={32} offset={-15} />
        <PosterColumn posters={columns[4]} direction="up"   duration={38} offset={-8}  />
      </div>

      {/* ── Overlays ── */}
      {/* Dark vignette from center out */}
      <div style={vignetteStyle} />
      {/* Radial clear zone around form */}
      <div style={clearZoneStyle} />

      {/* ── Glow orbs ── */}
      <div style={orbTopStyle} />
      <div style={orbBottomStyle} />

      {/* ── Form card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={cardStyle}
      >
        {/* Logo */}
        <div style={logoRowStyle}>
          <div style={logoMarkStyle}>T</div>
          <span style={logoTextStyle}>
            Trang<span style={{ color: "var(--color-accent)" }}>Mix</span>
          </span>
        </div>

        <h2 style={cardTitleStyle}>Welcome back</h2>
        <p style={cardSubStyle}>Sign in to continue watching</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>

          {/* Email */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <div style={{
              ...inputWrapStyle,
              ...(focused === "email" ? inputFocusStyle : {}),
            }}>
              <Mail size={14} style={inputIconStyle} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="your@email.com"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <div style={{
              ...inputWrapStyle,
              ...(focused === "password" ? inputFocusStyle : {}),
            }}>
              <Lock size={14} style={inputIconStyle} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={eyeBtnStyle}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={errorStyle}
              >
                ⚠ {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 32px var(--color-accent-glow)" } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{ ...submitStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
              : "Sign In"
            }
          </motion.button>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>demo accounts</span>
          <div style={dividerLineStyle} />
        </div>

        {/* Demo credentials */}
        <div style={demoBoxStyle}>
          {[
            { email: "demo@trangmix.com", pass: "demo123" },
            { email: "test@trangmix.com", pass: "test123" },
          ].map((cred) => (
            <motion.button
              key={cred.email}
              type="button"
              onClick={() => fillDemo(cred.email, cred.pass)}
              whileHover={{ background: "rgba(0,229,255,0.06)" }}
              style={demoRowStyle}
            >
              <span style={demoEmailStyle}>{cred.email}</span>
              <span style={demoPassStyle}>{cred.pass}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  background: "var(--color-surface)",
};

// Poster grid
const bgStyle = {
  position: "absolute",
  inset: 0,
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "8px",
  padding: "8px",
  overflow: "hidden",
};
const columnWrapStyle = {
  overflow: "hidden",
  borderRadius: "12px",
};
const columnInnerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};
const posterItemStyle = {
  borderRadius: "10px",
  overflow: "hidden",
  flexShrink: 0,
  aspectRatio: "2/3",
};
const posterImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  filter: "saturate(0.7) brightness(0.6)",
};

// Overlays
const vignetteStyle = {
  position: "absolute",
  inset: 0,
  background: `
    radial-gradient(
      ellipse 80% 80% at 50% 50%,
      rgba(8,11,20,0.55) 0%,
      rgba(8,11,20,0.88) 60%,
      rgba(8,11,20,0.97) 100%
    )
  `,
  zIndex: 1,
};
const clearZoneStyle = {
  position: "absolute",
  inset: 0,
  background: `
    radial-gradient(
      ellipse 50% 70% at 50% 50%,
      transparent 0%,
      transparent 40%,
      rgba(8,11,20,0.4) 100%
    )
  `,
  zIndex: 2,
};

// Glow orbs
const orbTopStyle = {
  position: "absolute",
  width: "600px",
  height: "600px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)",
  top: "-200px",
  left: "50%",
  transform: "translateX(-50%)",
  filter: "blur(40px)",
  zIndex: 2,
  pointerEvents: "none",
};
const orbBottomStyle = {
  position: "absolute",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,106,255,0.08) 0%, transparent 70%)",
  bottom: "-150px",
  left: "50%",
  transform: "translateX(-50%)",
  filter: "blur(40px)",
  zIndex: 2,
  pointerEvents: "none",
};

// Card
const cardStyle = {
  position: "relative",
  zIndex: 10,
  width: "100%",
  maxWidth: "400px",
  margin: "24px 16px",
  padding: "40px 36px",
  background: "rgba(10, 13, 22, 0.82)",
  backdropFilter: "blur(32px) saturate(160%)",
  WebkitBackdropFilter: "blur(32px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  boxShadow: `
    0 32px 80px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.04),
    inset 0 1px 0 rgba(255,255,255,0.06)
  `,
};
const logoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "28px",
};
const logoMarkStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "9px",
  background: "var(--color-accent)",
  color: "var(--color-surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: "18px",
  boxShadow: "0 0 20px var(--color-accent-glow)",
};
const logoTextStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "20px",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.5px",
};
const cardTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "26px",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.5px",
  marginBottom: "4px",
  lineHeight: 1.2,
};
const cardSubStyle = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "28px",
};

// Form
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};
const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};
const labelStyle = {
  fontSize: "11px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.4)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const inputWrapStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  transition: "border-color 200ms, box-shadow 200ms",
};
const inputFocusStyle = {
  borderColor: "var(--color-accent)",
  boxShadow: "0 0 0 3px rgba(0,229,255,0.12)",
};
const inputIconStyle = {
  position: "absolute",
  left: "14px",
  color: "rgba(255,255,255,0.25)",
  flexShrink: 0,
};
const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  padding: "13px 14px 13px 40px",
  fontSize: "14px",
  color: "#fff",
  fontFamily: "var(--font-body)",
  borderRadius: "12px",
};
const eyeBtnStyle = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.25)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "4px",
  borderRadius: "6px",
  transition: "color 150ms",
};
const errorStyle = {
  fontSize: "12px",
  color: "#f87171",
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: "8px",
  padding: "8px 12px",
};
const submitStyle = {
  marginTop: "4px",
  padding: "14px",
  borderRadius: "12px",
  background: "var(--color-accent)",
  color: "var(--color-surface)",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 4px 20px var(--color-accent-glow)",
  letterSpacing: "0.02em",
  transition: "opacity 200ms",
};

// Divider
const dividerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  margin: "24px 0 16px",
};
const dividerLineStyle = {
  flex: 1,
  height: "1px",
  background: "rgba(255,255,255,0.06)",
};
const dividerTextStyle = {
  fontSize: "10px",
  color: "rgba(255,255,255,0.25)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  whiteSpace: "nowrap",
};

// Demo box
const demoBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  background: "rgba(0,229,255,0.03)",
  border: "1px solid rgba(0,229,255,0.08)",
  borderRadius: "12px",
  padding: "4px",
};
const demoRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "9px 12px",
  borderRadius: "9px",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  background: "transparent",
  transition: "background 150ms",
};
const demoEmailStyle = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.55)",
  fontFamily: "var(--font-mono)",
};
const demoPassStyle = {
  fontSize: "11px",
  color: "var(--color-accent)",
  fontFamily: "var(--font-mono)",
  opacity: 0.7,
};
