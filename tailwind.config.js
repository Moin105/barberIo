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
        brand: {
          50: "#fbecec",
          100: "#f7d4d4",
          200: "#f0a5a5",
          400: "#d24343",
          500: "#b91c1c",
          600: "#991919",
          700: "#7a1313",
          800: "#5a0f0f",
        },
        brass: {
          400: "#cea24a",
          500: "#b48433",
          600: "#9c6c25",
        },
      },
      fontFamily: {
        display: ['"Bodoni Moda"', '"Playfair Display"', "ui-serif", "Georgia", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
      },
      boxShadow: {
        soft: "0 6px 28px -12px rgba(19, 17, 15, 0.18)",
        ring: "0 0 0 4px rgba(185, 28, 28, 0.14)",
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
        "brand-gradient": "linear-gradient(135deg, #b91c1c 0%, #7a1313 100%)",
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
