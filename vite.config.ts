import solid from 'solid-start/vite'
// @ts-expect-error
import vercel from 'solid-start-vercel'
import icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    solid({ adapter: vercel({ edge: false }) }),
    icons({ compiler: 'solid' }),
  ],
})
