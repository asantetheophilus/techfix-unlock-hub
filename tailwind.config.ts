import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        foreground: "#F8FAFC",
        brand: {
          dark: "#0A0A0F",
          navy: "#0D1B3E",
          cyan: "#00D4FF",
          mint: "#00FFB3",
        },
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        dmsans: ["var(--font-dmsans)", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 212, 255, 0.15)",
        "neon-mint": "0 0 20px rgba(0, 255, 179, 0.15)",
        "neon-strong": "0 0 30px rgba(0, 212, 255, 0.3)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      animation: {
        "grid-move": "grid-move 20s linear infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "border-beam": "border-beam 6s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        "grid-move": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6", filter: "brightness(1) drop-shadow(0 0 5px rgba(0, 212, 255, 0.3))" },
          "50%": { opacity: "1", filter: "brightness(1.2) drop-shadow(0 0 15px rgba(0, 212, 255, 0.6))" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
