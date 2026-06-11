/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b0b14",
          50: "#f6f6f8",
          100: "#eaeaef",
          200: "#cdcdda",
          400: "#6b6b85",
          700: "#1f1f2e",
          900: "#0b0b14",
        },
        brand: {
          50: "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc5c5",
          300: "#ff9a9a",
          400: "#ff5f5f",
          500: "#ef2b2b",
          600: "#cf1414",
          700: "#a90f0f",
          800: "#7a0c0c",
        },
        gold: {
          400: "#f5c662",
          500: "#e0a93b",
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 30px -10px rgba(15,15,35,.12)",
        glow: "0 0 0 4px rgba(239,43,43,.18)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "slow-spin": "spin 18s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #ef2b2b 0%, #cf1414 50%, #7a0c0c 100%)",
        "ink-gradient":
          "linear-gradient(135deg, #1f1f2e 0%, #0b0b14 100%)",
        grid:
          "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
