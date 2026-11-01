tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF7",
        card: "#FFFFFF",
        ink: "#1A1A1A",
        muted: "#6B6B6B",
        line: "#E7E5E0",
        night: "#111113",
        "night-card": "#1B1B1F",
        "night-ink": "#F2F2F0",
        "night-muted": "#A1A1A8",
        "night-line": "#2A2A30",
        brand: {
          DEFAULT: "#E4572E",
          hover: "#C9431D",
          soft: "#FCE9E3",
          light: "#FF7A50",
          deep: "#3A211A",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      },
    },
  },
};
