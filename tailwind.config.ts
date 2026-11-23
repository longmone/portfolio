import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171715",
        violet: "#6138e8",
        cyan: "#00a7b5",
        lime: "#d0ff35",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
