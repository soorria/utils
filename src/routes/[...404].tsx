import { A } from 'solid-start'

export default function NotFound() {
  console.log('Rendering 404')
  return (
    <main class="text-center space-y-8">
      <h1 class="text-5xl mt-16 text-primary">Page not found</h1>
      <div class="flex space-x-4 justify-center">
        <A href="/" class="link link-hover link-primary">
          back home
        </A>
      </div>
    </main>
  )
}
