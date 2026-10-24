import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/reshmakarthik08-CodeVariant/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
});
