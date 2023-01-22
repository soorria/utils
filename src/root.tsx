// @refresh reload
import { Suspense } from 'solid-js'
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title,
} from 'solid-start'
import { Toaster } from 'solid-toast'
import { HeartIconSolid } from './components/ui/icons'
import { BASE_URL, DEFAULT_TITLE, ogImage } from './lib/all-utils'
import './root.css'
// import 'dracula-prism/dist/css/dracula-prism.min.css'

const META = {
  title: DEFAULT_TITLE,
  description:
    'A bunch of micro-apps that are too small for creating a new project to be worth it. Some of them are useful, others less ...',
  image: ogImage('Utils'),
}

export default function Root() {
  return (
    <Html lang="en" data-theme="dracula">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />

        <script
          async
          defer
          data-domain="utils.soorria.com"
          data-api="https://soorria.com/proxy/api/event"
          src="https://soorria.com/js/potato.js"
        />
        <Link rel="preconnect" href="https://fonts.googleapis.com" />
        <Link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <Link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;700;900&display=swap"
        />
        <Title>{META.title}</Title>
        <Meta name="description" content={META.description} />
        <Meta name="image" content={META.image} />
        <Meta property="og:url" content={BASE_URL} />
        <Meta property="og:type" content="website" />
        <Meta property="og:image" content={META.image} />
        <Meta property="og:image:width" content="1200" />
        <Meta property="og:image:height" content="630" />
        <Meta property="og:description" content={META.description} />
        <Meta property="og:locale" content="en_AU" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:creator" content="@soorriously" />
        <Meta name="twitter:site" content="@soorriously" />
        <Meta name="twitter:title" content={META.title} />
        <Meta name="twitter:alt" content={META.title} />
      </Head>
      <Body class="h-full flex flex-col">
        <Suspense>
          <ErrorBoundary>
            <div class="max-w-screen-lg w-full mx-auto py-8 px-4 md:px-8 md:py-12 space-y-8 flex flex-col h-full flex-1">
              <header>
                <nav class="flex items-center space-x-2">
                  <A
                    href="/"
                    class="text-4xl text-primary font-bold font-display focus-outline rounded-btn px-2 -mx-2"
                  >
                    utils
                  </A>
                  <div class="flex-1" />
                  <A
                    href="/"
                    class="link link-hover link-primary text-xl rounded-btn px-1"
                  >
                    home
                  </A>
                </nav>
              </header>
              <div class="flex-1 flex flex-col">
                <Routes>
                  <FileRoutes />
                </Routes>
              </div>
            </div>
            <footer class="py-8 text-center flex flex-col items-center space-y-4">
              <a
                href="https://soorria.com/?ref=Utils"
                target="_blank"
                rel="noopener noreferrer"
                class="group link link-hover inline-block focus-outline px-2 rounded-btn"
              >
                Made with{' '}
                <span class="relative inline-block h-5 w-5 align-middle">
                  <HeartIconSolid class="absolute inset-0 fill-current text-pink" />
                  <HeartIconSolid class="absolute inset-0 fill-current text-purple group-hover:animate-ping" />
                </span>{' '}
                by{' '}
                <span class="underline group-hover:no-underline">Soorria</span>
              </a>
              <a
                href="https://github.com/soorria/utils"
                target="_blank"
                rel="noopener noreferrer"
                class="group link link-hover inline-block focus-outline px-2 rounded-btn"
              >
                <span class="underline group-hover:no-underline">Source</span>{' '}
                on GitHub
              </a>
              <a
                href="https://soorria.com/#contact"
                target="_blank"
                rel="noopener noreferrer"
                class="group link link-hover inline-block focus-outline px-2 rounded-btn"
              >
                Feedback &amp; Suggestions
              </a>
            </footer>
          </ErrorBoundary>
        </Suspense>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              'background-color': 'hsl(var(--n))',
              color: 'hsl(var(--nc))',
            },
            // success: {
            //   iconTheme: {
            //     primary: 'hsl(var(--su))',
            //     secondary: 'hsl(var(--suc))',
            //   },
            // },
            // error: {
            //   iconTheme: {
            //     primary: 'hsl(var(--er))',
            //     secondary: 'hsl(var(--erc))',
            //   },
            // },
          }}
        />
        <Scripts />
      </Body>
    </Html>
  )
}
