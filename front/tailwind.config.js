// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
};
