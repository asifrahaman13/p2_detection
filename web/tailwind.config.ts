import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundColor: {
        sideBarGradient: "#405386",
        dashBoradBackground: "#F9FAFB",
        buttonsBackgound: "#EFF3FA",
        selectedButton: "#4977B4",
        keywordColor: "#CEDCE7",
        blueButton: "#1D68BA",
      },
      textColor: {
        buttonTextColor: "#405386",
        casesColor: "#5C6A7E",
        viewColor: "#0965E2",
        blueButton: "#1D68BA",
      },
      borderColor: {
        sideBarBorder: "#405386",
        blueButton: "#1D68BA",
      },
    },
  },
  plugins: [],
};
export default config;
