import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",

  theme: {
    colors: {
      white: "var(--white)",
      black: "var(--black)",
      background: "var(--background)",
      gray: "var(--gray)",
      smoky: "var(--smoky)",
      dark: "var(--dark)",
      coal: "var(--coal)",
      orange: "var(--orange)",
      red: "var(--red)",
    },

    extend: {
      fontFamily: {
        noto: ["var(--font-noto)", "Noto Sans", "sans-serif"],
      },
    },
  },
};

export default config;
