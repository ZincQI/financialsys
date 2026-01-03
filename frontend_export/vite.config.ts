import { defineConfig } from 'vite'
// @ts-ignore - Vite 配置文件中可以使用相对路径
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': '/src',
    },
  },
  optimizeDeps: {
    // 预构建优化，加快首次加载速度
    include: [
      'react',
      'react-dom',
      'date-fns',
      'lucide-react',
    ],
    // 排除一些不需要预构建的依赖
    exclude: [],
  },
  server: {
    // 开发服务器配置
    host: '0.0.0.0', // 监听所有网络接口，允许外部访问
    port: 5173,
    hmr: {
      overlay: true,
    },
    // 代理配置：将 /api 请求代理到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // 构建优化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
          'date-vendor': ['date-fns'],
        },
      },
    },
  },
})
