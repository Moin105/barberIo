/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#f6f1e7",
          50: "#fbf8f1",
          100: "#f1ead9",
          200: "#e6dcc2",
        },
        ink: {
          DEFAULT: "#13110f",
          50: "#f4f1ec",
          100: "#e8e1d3",
          200: "#cdc4b3",
          400: "#6b6357",
          700: "#1f1c18",
          900: "#13110f",
        },
        // Electric orange — bright, saturated, modern. Drives the brand.
        brand: {
          50: "#fff4ea",
          100: "#ffe2cb",
          200: "#ffc28d",
          300: "#ffa057",
          400: "#ff8024",
          500: "#ff6a00",
          600: "#e85a00",
          700: "#bc4500",
          800: "#8c3300",
        },
        brass: {
          400: "#cea24a",
          500: "#b48433",
          600: "#9c6c25",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
      boxShadow: {
        soft: "0 6px 28px -12px rgba(19, 17, 15, 0.18)",
        ring: "0 0 0 4px rgba(255, 106, 0, 0.20)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "slow-pole": "polePan 9s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        polePan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 56px" },
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #ff7a1a 0%, #ff6a00 45%, #c14600 100%)",
        "ink-gradient": "linear-gradient(135deg, #1f1c18 0%, #13110f 100%)",
        grid:
          "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
        "paper-grain":
          "radial-gradient(rgba(19,17,15,0.045) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
