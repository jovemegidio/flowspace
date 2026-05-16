/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#111111",
          1: "#181818",
          2: "#202020",
          3: "#282828",
          border: "#2a2a2a",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          dim: "#6366f115",
        },
        spotify: {
          DEFAULT: "#1DB954",
          dim: "#1DB95415",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-soft": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}
