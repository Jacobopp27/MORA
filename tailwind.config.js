module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mora: { DEFAULT: '#7c3aed', 50: '#f5f3ff', 100: '#ede9fe', 600: '#7c3aed', 700: '#6d28d9' }
      }
    }
  },
  plugins: [],
}
