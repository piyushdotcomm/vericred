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
        surface: "#F7F8FA",
        ink: "#10161F",
        registry: "#14293E",
        accent: "#0E5A8A",
        valid: "#1F7A4D",
        tampered: "#B3261E",
        revoked: "#A06000",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        soft: "14px",
      },
    },
  },
  plugins: [],
};
