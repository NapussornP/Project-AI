import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5041, // แก้ตรงนี้เป็นพอร์ตที่คุณต้องการ
  },
  build: {
    outDir: 'build'
  }
  
})
