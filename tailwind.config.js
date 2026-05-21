/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				light: 'hsl(var(--primary-light))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				light: 'hsl(var(--secondary-light))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  				light: 'hsl(var(--success-light))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))',
  				light: 'hsl(var(--info-light))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  				light: 'hsl(var(--warning-light))'
  			},
  			danger: {
  				DEFAULT: 'hsl(var(--danger))',
  				foreground: 'hsl(var(--danger-foreground))',
  				light: 'hsl(var(--danger-light))'
  			},
  			dark: {
  				DEFAULT: 'hsl(var(--dark))',
  				foreground: 'hsl(var(--dark-foreground))'
  			},
  			light: {
  				DEFAULT: 'hsl(var(--light))',
  				foreground: 'hsl(var(--light-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'notif-bell-ring': {
  				'0%, 100%': { transform: 'rotate(0deg) scale(1)' },
  				'1.5%': { transform: 'rotate(-24deg) scale(1.08)' },
  				'3%': { transform: 'rotate(22deg) scale(1.08)' },
  				'4.5%': { transform: 'rotate(-18deg) scale(1.06)' },
  				'6%': { transform: 'rotate(16deg) scale(1.06)' },
  				'7.5%': { transform: 'rotate(-11deg) scale(1.03)' },
  				'9%': { transform: 'rotate(9deg) scale(1.03)' },
  				'10.5%': { transform: 'rotate(-5deg) scale(1)' },
  				'12%': { transform: 'rotate(0deg) scale(1)' },
  				'16%': { transform: 'rotate(-14deg) scale(1.05)' },
  				'17.5%': { transform: 'rotate(12deg) scale(1.05)' },
  				'19%': { transform: 'rotate(-6deg) scale(1)' },
  				'20.5%': { transform: 'rotate(0deg) scale(1)' },
  			},
  			'notif-aura': {
  				'0%, 100%': { opacity: '0.22', transform: 'scale(0.72)' },
  				'35%': { opacity: '0.7', transform: 'scale(1.18)' },
  				'55%': { opacity: '0.4', transform: 'scale(0.95)' },
  				'70%': { opacity: '0.28', transform: 'scale(1.05)' },
  			},
  			'notif-badge-pulse': {
  				'0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
  				'50%': { transform: 'scale(1.12)', filter: 'brightness(1.15)' },
  			},
  		},
  		animation: {
  			'notif-bell-ring': 'notif-bell-ring 2.35s cubic-bezier(0.34, 1.56, 0.64, 1) infinite',
  			'notif-aura': 'notif-aura 2.1s ease-in-out infinite',
  			'notif-badge-pulse': 'notif-badge-pulse 1.25s ease-in-out infinite',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

