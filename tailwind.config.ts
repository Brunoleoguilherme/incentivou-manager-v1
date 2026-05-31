import type { Config } from 'tailwindcss'
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { azul:'#0767C7', verde:'#40B86A', lima:'#A5CC28', escuro:'#081C2D', gelo:'#F6FAFF' } } }, plugins: [] }
export default config
