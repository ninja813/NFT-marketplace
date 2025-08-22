import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        teal: '#14B8A6',
        gold: '#F59E0B',
        ink: '#0B1021',
        glass: 'rgba(255,255,255,0.08)',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      backgroundImage: {
        'lux-gradient': 'linear-gradient(135deg, #0B1021 0%, #111827 100%)',
        'hero-gradient':
          'radial-gradient(1200px 600px at 0% 0%, rgba(139, 92, 246, 0.25), transparent 60%), radial-gradient(1000px 400px at 100% 0%, rgba(20, 184, 166, 0.2), transparent 60%), radial-gradient(800px 400px at 50% 100%, rgba(245, 158, 11, 0.15), transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
