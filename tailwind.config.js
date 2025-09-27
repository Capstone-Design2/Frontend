/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        card: 'hsl(var(--card))',
        muted: 'hsl(var(--muted))',
        fg: 'hsl(var(--fg))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        success: 'hsl(var(--success))',
        danger: 'hsl(var(--danger))',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0,0,0,0.5)'
      },
      borderRadius: {
        xl: '1rem'
      }
    },
  },
  plugins: [],
}
