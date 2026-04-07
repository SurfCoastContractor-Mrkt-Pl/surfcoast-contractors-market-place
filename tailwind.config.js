/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  safelist: [
    // Gradient utilities
    'gradient-brand', 'gradient-soft', 'gradient-hero', 'gradient-card', 'gradient-text',
    'nav-pill-active',
    // SC design system utilities
    'sc-card', 'sc-card-amber', 'sc-card-dark',
    'sc-hover-glow', 'sc-tag', 'sc-btn', 'sc-btn-dark', 'sc-btn-amber', 'sc-btn-outline',
    'sc-badge', 'sc-badge-dark', 'sc-badge-success', 'sc-badge-warning', 'sc-badge-error',
    'sc-bg-page', 'sc-bg-section', 'sc-bg-alt', 'sc-bg-dark', 'sc-bg-amber',
    'sc-heading', 'sc-subheading', 'sc-body', 'sc-mono', 'sc-section-label',
    'sc-input', 'sc-alert', 'sc-alert-error', 'sc-alert-success', 'sc-table', 'sc-divider',
    'sc-ticker',
    // Legacy color classes still used in some components
    'border-blue-100', 'border-blue-300', 'hover:border-blue-300', 'bg-blue-100', 'bg-blue-600', 'text-blue-600', 'hover:text-blue-700', 'hover:bg-blue-600',
    'border-orange-100', 'border-orange-300', 'hover:border-orange-300', 'bg-orange-100', 'bg-orange-600', 'text-orange-600', 'hover:text-orange-700', 'hover:bg-orange-600',
    'border-green-100', 'border-green-300', 'hover:border-green-300', 'bg-green-100', 'bg-green-600', 'text-green-600', 'hover:text-green-700', 'hover:bg-green-600',
    'border-amber-300', 'bg-amber-50', 'text-amber-900', 'bg-amber-100',
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
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
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
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}