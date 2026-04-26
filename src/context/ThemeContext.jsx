import { createContext, useContext, useState, useCallback } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [accentColor, setAccentColor] = useState("#06b6d4"); // default cyan

  // Canvas-based dominant color extraction from poster image
  const extractColors = useCallback((imageUrl) => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 50;
        canvas.height = 75;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 50, 75);

        const data = ctx.getImageData(0, 0, 50, 75).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 16) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          // Skip near-black and near-white pixels
          const brightness = (pr + pg + pb) / 3;
          if (brightness > 30 && brightness < 230) {
            r += pr; g += pg; b += pb; count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);

          // Boost saturation a bit
          const max = Math.max(r, g, b);
          const factor = 1.4;
          r = Math.min(255, Math.round(r + (r - max / 3) * factor * 0.3));
          g = Math.min(255, Math.round(g + (g - max / 3) * factor * 0.3));
          b = Math.min(255, Math.round(b + (b - max / 3) * factor * 0.3));

          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          setAccentColor(hex);
          document.documentElement.style.setProperty("--color-accent", hex);
        }
      } catch (err) {
        // CORS or canvas error — silently ignore
      }
    };
  }, []);

  // Manual theme override
  const setAccent = useCallback((hex) => {
    setAccentColor(hex);
    document.documentElement.style.setProperty("--color-accent", hex);
  }, []);

  return (
    <ThemeContext.Provider value={{ accentColor, extractColors, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
