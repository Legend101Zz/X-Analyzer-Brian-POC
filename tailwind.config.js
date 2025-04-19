module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neuron: {
          primary: "#6366f1", // Main application color (indigo)
          secondary: "#818cf8", // Secondary elements (lighter indigo)
          accent: "#4f46e5", // Accent elements (darker indigo)
          synaptic: "#34d399", // Success/positive states (emerald)
          inhibitory: "#f43f5e", // Warning/negative states (rose)
          pulse: "#a5b4fc", // Animation/activity color (light indigo)
          canvas: {
            light: "#f9fafb", // Light mode background
            dark: "#111827", // Dark mode background
          },
          text: {
            light: "#1f2937",
            dark: "#f3f4f6",
            muted: {
              light: "#6b7280",
              dark: "#9ca3af",
            },
          },
        },
      },
      boxShadow: {
        neuron: "0 0 15px rgba(99, 102, 241, 0.4)",
        "neuron-hover": "0 0 20px rgba(99, 102, 241, 0.6)",
        "neuron-dark": "0 0 15px rgba(129, 140, 248, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "neural-trace": "neural-trace 2s ease-in-out",
      },
      keyframes: {
        "neural-trace": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
