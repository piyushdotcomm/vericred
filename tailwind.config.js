/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0A0A0A",
        surfaceElevated: "#111111",
        ink: "#FFFFFF",
        inkMuted: "#888888",
        border: "#222222",
        accent: "#FFFFFF",
        accentHover: "#CCCCCC",
        valid: "#00FF66",
        validBg: "#00FF661A",
        tampered: "#FF3333",
        tamperedBg: "#FF33331A",
        revoked: "#FFAA00",
        revokedBg: "#FFAA001A",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        soft: "12px",
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
      }
    },
  },
  plugins: [],
};
