import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "text-right",
    "italic",
    "opacity-80",
    "not-prose",
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
};