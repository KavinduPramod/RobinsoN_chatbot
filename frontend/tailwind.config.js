/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d0f',
        surface: '#16161a',
        surface2: '#1e1e24',
        surface3: '#26262e',
        border: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.12)',
        text: '#f0eff4',
        text2: '#9998a8',
        text3: '#5e5d6e',
        accent: '#7c6aff',
        accent2: '#a78bfa',
        'accent-dim': 'rgba(124,106,255,0.12)',
        'accent-glow': 'rgba(124,106,255,0.2)',
        'robin-msg': '#1a1a24',
        'user-msg': '#201e36',
        'green': '#22c55e',
        'green-dim': 'rgba(34,197,94,0.1)',
      },
      fontFamily: {
        display: "'Syne', sans-serif",
        body: "'DM Sans', sans-serif",
      },
      borderRadius: {
        r: '16px',
        'r-sm': '8px',
        'r-lg': '24px',
      },
    },
  },
  plugins: [],
}
