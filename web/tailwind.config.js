/** @type {import('tailwindcss').Config} */
// Every palette entry resolves through a CSS variable (see styles.css), so the
// dark theme is a variable swap on <html class="dark"> rather than a `dark:`
// variant on each of the ~160 colour utilities scattered through the app.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

const scale = (prefix, shades) =>
  Object.fromEntries(shades.map((s) => [s, v(`${prefix}-${s}`)]));

const NEUTRAL_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const ACCENT_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Card/menu background. Was a literal `white`, which can't flip.
        surface: v("surface"),
        brand: { 25: v("brand-25"), ...scale("brand", NEUTRAL_SHADES) },
        // A warmer, quieter neutral than Tailwind's default slate; overriding
        // the name cascades through every existing slate-* class in the app.
        slate: scale("slate", NEUTRAL_SHADES),
        amber: scale("amber", ACCENT_SHADES),
        emerald: scale("emerald", ACCENT_SHADES),
        red: scale("red", ACCENT_SHADES),
        lime: scale("lime", ACCENT_SHADES),
        orange: scale("orange", ACCENT_SHADES),
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
