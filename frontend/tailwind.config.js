/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Lumina Dark Semantic Palette
        "background": "var(--color-background, #131313)",
        "surface": "var(--color-surface, #131313)",
        "surface-bright": "var(--color-surface-bright, #1a1a1a)",
        "surface-dim": "var(--color-surface-dim, #131313)",
        "surface-container-lowest": "var(--color-surface-lowest, #0e0e0e)",
        "surface-container-low": "var(--color-surface-low, #1c1b1b)",
        "surface-container": "var(--color-surface-container, #222222)",
        "surface-container-high": "var(--color-surface-high, #2a2a2a)",
        "surface-container-highest": "var(--color-surface-highest, #353534)",
        "surface-variant": "#353534",
        "on-surface": "var(--color-on-surface, #eeeeee)",
        "on-surface-variant": "var(--color-on-surface-variant, #c5c6ce)",
        "on-background": "var(--color-on-background, #e5e2e1)",
        "primary": "var(--color-primary, #b6c7ec)",
        "primary-container": "var(--color-primary-container, #8292b5)",
        "on-primary": "#20304e",
        "on-primary-container": "#1a2b48",
        "secondary": "var(--color-secondary, #c6c6c7)",
        "outline": "var(--color-outline, #333333)",
        "outline-variant": "var(--color-outline-variant, #44474d)",
        "tertiary": "#e4c18a",
        "error": "#ffb4ab",
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "sm": "0.5rem",
        "md": "1.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px",
      },
      spacing: {
        "base": "8px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        "max-width": "1280px",
      },
      fontFamily: {
        "headline": ["Hanken Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "mono": ["Geist", "monospace"],
      },
    },
  },
  plugins: [],
};
