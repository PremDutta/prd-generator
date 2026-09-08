/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          25: "#f7f8ff",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // Overridden to match a warmer, quieter neutral scale (fanout.sh-style)
        // instead of Tailwind's cooler default slate — this cascades through
        // every existing slate-* utility class in the app.
        slate: {
          50: "#f7f7f8",
          100: "#f0f0f1",
          200: "#e8e8ea",
          300: "#d4d4d6",
          400: "#a0a0a3",
          500: "#6e6e6e",
          600: "#4b4b4d",
          700: "#383838",
          800: "#2f2f2f",
          900: "#272727",
        },
      },
      fontFamily: {
        sans: ["Overused Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["Departure Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Sized up from Tailwind's defaults (not just restored) — tight tracking
        // reads fine at display sizes but was making body/UI text feel cramped.
        xs: ["0.8125rem", { lineHeight: "1.2rem", letterSpacing: "0" }],
        sm: ["0.90625rem", { lineHeight: "1.4rem", letterSpacing: "-0.006em" }],
        base: ["1rem", { lineHeight: "1.6rem", letterSpacing: "-0.011em" }],
        lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.014em" }],
        xl: ["1.3125rem", { lineHeight: "1.85rem", letterSpacing: "-0.017em" }],
        "2xl": ["1.625rem", { lineHeight: "2.05rem", letterSpacing: "-0.02em" }],
        "3xl": ["2rem", { lineHeight: "2.35rem", letterSpacing: "-0.024em" }],
        "4xl": ["2.5rem", { lineHeight: "2.75rem", letterSpacing: "-0.03em" }],
        "5xl": ["3.25rem", { lineHeight: "3.5rem", letterSpacing: "-0.036em" }],
        "6xl": ["4rem", { lineHeight: "4.2rem", letterSpacing: "-0.04em" }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 6px -1px rgb(15 23 42 / 0.06)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)",
        elevated: "0 4px 16px -4px rgb(15 23 42 / 0.10), 0 2px 6px -2px rgb(15 23 42 / 0.06)",
        "brand-glow": "0 8px 20px -6px rgb(79 70 229 / 0.35)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(2px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
