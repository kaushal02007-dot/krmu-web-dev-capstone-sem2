import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchTrending, getImageUrl } from "../api/tmdb";

// ─── CSS injected once ──────────────────────────────────────
const CSS = `
  @keyframes scrollUp {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
  @keyframes scrollDown {
    0%   { transform: translateY(-50%); }
    100% { transform: translateY(0); }
  }
  .col-up {
    animation: scrollUp var(--dur, 30s) linear infinite;
    will-change: transform;
  }
  .col-down {
    animation: scrollDown var(--dur, 30s) linear infinite;
    will-change: transform;
  }
  .poster-col img {
    filter: saturate(0.65) brightness(0.55);
    display: block;
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 10px;
  }
`;

function injectCSS() {
  if (document.getElementById("login-col-css")) return;
  const tag = document.createElement("style");
  tag.id = "login-col-css";
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

// ─── Single column — pure CSS scroll, never stops ──────────
function PosterColumn({ posters, direction, duration }) {
  if (!posters.length) return null;

  // Triple the posters so there's always content visible
  const items = [...posters, ...posters, ...posters];

  return (
    <div className="poster-col" style={colWrapStyle}>
      <div
        className={direction === "up" ? "col-up" : "col-down"}
        style={{ "--dur": `${duration}s`, display: "flex", flexDirection: "column", gap: "8px" }}
      >
        {items.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            onError={(e) => { e.target.style.visibility = "hidden"; }}
          />
        ))}
      </div>
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
  const [password, setPassword] = useState("demo123");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [focused,  setFocused]  = useState(null);
  const [columns,  setColumns]  = useState([[], [], [], [], []]);

  // Inject CSS keyframes once
  useEffect(() => { injectCSS(); }, []);

  // Fetch posters once on mount
  useEffect(() => {
    fetchTrending("all", "week")
      .then((data) => {
        const posters = (data?.results || [])
          .filter((r) => r.poster_path)
          .map((r) => getImageUrl(r.poster_path, "w342"));

        // Need at least 8 per column — pad by repeating
        while (posters.length < 40) posters.push(...posters.slice(0, 20));

        // Shuffle for variety
        const shuffled = [...posters].sort(() => Math.random() - 0.5);

        const chunk = (arr, size) =>
          Array.from({ length: 5 }, (_, i) => arr.slice(i * size, i * size + size));

        setColumns(chunk(shuffled, 8));
      })
      .catch(() => {});
  }, []); // Empty deps — run once, never re-runs

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

  const fillDemo = (em, pass) => {
    setEmail(em);
    setPassword(pass);
    setError("");
  };

  // Column config — direction and speed
  const COL_CONFIG = [
    { direction: "up",   duration: 38 },
    { direction: "down", duration: 29 },
    { direction: "up",   duration: 44 },
    { direction: "down", duration: 33 },
    { direction: "up",   duration: 41 },
  ];

  return (
    <div style={pageStyle}>

      {/* ── Poster grid ── */}
      <div style={bgGridStyle} aria-hidden="true">
        {COL_CONFIG.map((cfg, i) => (
          <PosterColumn
            key={i}
            posters={columns[i]}
            direction={cfg.direction}
            duration={cfg.duration}
          />
        ))}
      </div>

      {/* ── Overlays ── */}
      <div style={overlay1} />
      <div style={overlay2} />

      {/* ── Glow orbs ── */}
      <div style={orbCyan} />
      <div style={orbPurple} />

      {/* ── Glass card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
            <div style={{ ...inputWrapStyle, ...(focused === "email" ? inputFocusStyle : {}) }}>
              <Mail size={14} style={iconStyle} />
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
            <div style={{ ...inputWrapStyle, ...(focused === "password" ? inputFocusStyle : {}) }}>
              <Lock size={14} style={iconStyle} />
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
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            style={{ ...submitStyle, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading
              ? <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
              : "Sign In"
            }
          </motion.button>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={divLineStyle} />
          <span style={divTextStyle}>demo accounts</span>
          <div style={divLineStyle} />
        </div>

        {/* Demo credentials — click to fill */}
        <div style={demoBoxStyle}>
          {[
            { email: "demo@trangmix.com", pass: "demo123" },
            { email: "test@trangmix.com", pass: "test123" },
          ].map((c) => (
            <button
              key={c.email}
              type="button"
              onClick={() => fillDemo(c.email, c.pass)}
              style={demoBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,229,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={demoEmailStyle}>{c.email}</span>
              <span style={demoPassStyle}>{c.pass}</span>
            </button>
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
const bgGridStyle = {
  position: "absolute",
  inset: 0,
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "8px",
  padding: "8px",
  overflow: "hidden",
  pointerEvents: "none",
};
const colWrapStyle = {
  overflow: "hidden",
  borderRadius: "10px",
};

// Layered overlays
const overlay1 = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse 90% 90% at 50% 50%, rgba(8,11,20,0.6) 0%, rgba(8,11,20,0.93) 70%, rgba(8,11,20,0.99) 100%)",
  zIndex: 1,
  pointerEvents: "none",
};
const overlay2 = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to bottom, rgba(8,11,20,0.5) 0%, transparent 30%, transparent 70%, rgba(8,11,20,0.5) 100%)",
  zIndex: 1,
  pointerEvents: "none",
};

// Glow orbs
const orbCyan = {
  position: "absolute",
  width: "700px",
  height: "700px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
  top: "-250px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2,
  pointerEvents: "none",
};
const orbPurple = {
  position: "absolute",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,106,255,0.07) 0%, transparent 70%)",
  bottom: "-180px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2,
  pointerEvents: "none",
};

// Card
const cardStyle = {
  position: "relative",
  zIndex: 10,
  width: "100%",
  maxWidth: "390px",
  margin: "24px 16px",
  padding: "38px 34px",
  background: "rgba(8, 11, 20, 0.78)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "24px",
  boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
};
const logoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "26px",
};
const logoMarkStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  background: "var(--color-accent)",
  color: "#080b14",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: "17px",
  boxShadow: "0 0 18px var(--color-accent-glow)",
  flexShrink: 0,
};
const logoTextStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "19px",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.4px",
};
const cardTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "24px",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.4px",
  marginBottom: "4px",
  lineHeight: 1.2,
};
const cardSubStyle = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.38)",
  marginBottom: "26px",
};

// Form
const formStyle = { display: "flex", flexDirection: "column", gap: "14px" };
const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};
const inputWrapStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  borderRadius: "11px",
  border: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.04)",
  transition: "border-color 200ms ease, box-shadow 200ms ease",
};
const inputFocusStyle = {
  borderColor: "rgba(0,229,255,0.5)",
  boxShadow: "0 0 0 3px rgba(0,229,255,0.1)",
};
const iconStyle = {
  position: "absolute",
  left: "13px",
  color: "rgba(255,255,255,0.2)",
  flexShrink: 0,
};
const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  padding: "12px 13px 12px 38px",
  fontSize: "14px",
  color: "#fff",
  fontFamily: "var(--font-body)",
  borderRadius: "11px",
};
const eyeBtnStyle = {
  position: "absolute",
  right: "11px",
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.22)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "4px",
  borderRadius: "6px",
};
const errorStyle = {
  fontSize: "12px",
  color: "#f87171",
  background: "rgba(239,68,68,0.07)",
  border: "1px solid rgba(239,68,68,0.18)",
  borderRadius: "8px",
  padding: "8px 12px",
};
const submitStyle = {
  marginTop: "4px",
  padding: "13px",
  borderRadius: "11px",
  background: "var(--color-accent)",
  color: "#080b14",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "14px",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 4px 20px var(--color-accent-glow)",
  letterSpacing: "0.02em",
  transition: "opacity 200ms, box-shadow 200ms",
};

// Divider
const dividerStyle = { display: "flex", alignItems: "center", gap: "10px", margin: "22px 0 14px" };
const divLineStyle = { flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" };
const divTextStyle = {
  fontSize: "10px",
  color: "rgba(255,255,255,0.22)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  whiteSpace: "nowrap",
};

// Demo box
const demoBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  background: "rgba(0,229,255,0.025)",
  border: "1px solid rgba(0,229,255,0.07)",
  borderRadius: "11px",
  padding: "4px",
};
const demoBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "9px 11px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  background: "transparent",
  transition: "background 150ms",
};
const demoEmailStyle = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.5)",
  fontFamily: "var(--font-mono)",
};
const demoPassStyle = {
  fontSize: "11px",
  color: "var(--color-accent)",
  fontFamily: "var(--font-mono)",
  opacity: 0.65,
};
