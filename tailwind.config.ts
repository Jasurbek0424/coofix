import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        background: "#f2f5f7",
        black: "#000000",
        orange: "#f05a00",
        red: "#fc573b",
        gray: {
          DEFAULT: "#dedbdb",
          smoky: "#8a8a8a",
          dark: "#3b3b3b",
          coal: "#212526",
        },
      },
      fontFamily: {
        noto: ["var(--font-noto)", "Noto Sans", "sans-serif"],
      },
    },
  },
};

export default config;
