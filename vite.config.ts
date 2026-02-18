import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()] as any,
	
	// Build optimizations
	build: {
		// Enable source maps for debugging but minimize bundle size
		sourcemap: true,
		// Minify CSS and JS
		minify: 'esbuild',
		// Target modern browsers for better optimization
		target: 'esnext',
		// Enable CSS code splitting
		cssCodeSplit: true
	},
	
	// Development optimizations
	server: {
		port: 20251,
		// Enable HMR for faster development
		hmr: {
			overlay: false
		}
	},
	
	// Resolve optimizations
	resolve: {
		// Enable faster module resolution
		alias: {
			$lib: './src/lib'
		}
	},
	
	// Configuration for the Preview Server (npm run preview)
	preview: {
		// 1. Host
		// Changes the listening address from default 'localhost' to '0.0.0.0'
		// so it can be accessed from the local network IP.
		host: true, // equivalent to running --host

		// 2. Allowed Hosts
		// List of hostnames or IP addresses allowed to access the preview server.
		// If set to true (or omitted), all hosts are allowed.
		// For security control:
		// allowedHosts: ['my-project.local', '192.168.1.10'] 
		allowedHosts: true,
	},
});

