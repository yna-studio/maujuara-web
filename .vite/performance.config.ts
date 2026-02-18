import type { UserConfig } from 'vite';

export const performanceConfig: Partial<UserConfig> = {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework
          framework: ['@sveltejs/kit', 'svelte'],
          
          // Database and API
          database: ['mongodb'],
          
          // Authentication and security
          auth: ['bcryptjs'],
          
          // Image processing
          media: ['cloudinary'],
          
          // HTTP client
          http: ['axios'],
          
          // Utility libraries
          utils: []
        }
      }
    },
    
    // Enable tree shaking
    minify: 'esbuild',
    
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Target modern browsers
    target: 'esnext'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      '@sveltejs/kit',
      'svelte',
      'mongodb',
      'bcryptjs',
      'axios',
      'cloudinary'
    ]
  },
  
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: string }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    }
  }
};
