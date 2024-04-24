import { LinksFunction } from '@remix-run/node'
import Link from '~/components/BaseLink'
import type { MetaFunction } from '@remix-run/node'
import { ClientOnly } from 'remix-utils/client-only'
import appStyles from './app.css'
import { Toaster } from 'react-hot-toast'
import { BASE_URL, DEFAULT_TITLE, ogImage } from './lib/all-utils'
import PageLoadingIndicator from './components/PageLoadingIndicator'
import { PRISM_CSS_HREF } from './lib/prism'
import { HeartIcon } from '@heroicons/react/outline'
import { metaV1 } from '@remix-run/v1-meta'
import { ReactNode } from 'react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react'
import { ErrorBoundaryComponent } from '@remix-run/react/dist/routeModules'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: appStyles },
    { rel: 'stylesheet', href: PRISM_CSS_HREF },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;700;900&display=swap',
    },
    {
      rel: 'canonical',
      href: 'https://utils.soorria.com',
    },
  ]
}

export const meta: MetaFunction = args => {
  const image = ogImage('Utils')
  const description =
    'A bunch of micro-apps that are too small for creating a new project to be worth it. Some of them are useful, others less ...'
  const title = DEFAULT_TITLE

  return metaV1(args, {
    title,
    description,
    image,
    'og:url': BASE_URL,
    'og:type': 'website',
    'og:image': image,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:description': description,
    'og:locale': 'en_AU',
    'twitter:card': 'summary_large_image',
    'twitter:creator': '@soorriously',
    'twitter:site': '@soorriously',
    'twitter:title': title,
    'twitter:alt': title,
  })
}

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" data-theme="dracula">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          async
          defer
          data-domain="utils.soorria.com"
          data-api="https://soorria.com/proxy/api/event"
          src="https://soorria.com/js/potato.js"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <ClientOnly>{() => <PageLoadingIndicator />}</ClientOnly>
        <div className="max-w-screen-lg w-full mx-auto py-8 px-4 md:px-8 md:py-12 space-y-8 flex flex-col h-full flex-1">
          <header>
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className="text-4xl text-primary font-bold font-display focus-outline rounded-btn px-2 -mx-2"
              >
                utils
              </Link>
              <div className="flex-1" />
              <Link
                to="/"
                className="link link-hover link-primary text-xl rounded-btn px-1"
              >
                home
              </Link>
            </nav>
          </header>
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
        <footer className="py-8 text-center flex flex-col items-center space-y-4">
          <a
            href="https://soorria.com/?ref=Utils"
            target="_blank"
            rel="noopener noreferrer"
            className="group link link-hover inline-block focus-outline px-2 rounded-btn"
          >
            Made with{' '}
            <span className="relative inline-block h-5 w-5 align-middle">
              <HeartIcon className="absolute inset-0 fill-current text-pink" />
              <HeartIcon className="absolute inset-0 fill-current text-purple group-hover:animate-ping" />
            </span>{' '}
            by{' '}
            <span className="underline group-hover:no-underline">Soorria</span>
          </a>
          <a
            href="https://github.com/soorria/utils"
            target="_blank"
            rel="noopener noreferrer"
            className="group link link-hover inline-block focus-outline px-2 rounded-btn"
          >
            <span className="underline group-hover:no-underline">Source</span>{' '}
            on GitHub
          </a>
          <a
            href="https://soorria.com/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="group link link-hover inline-block focus-outline px-2 rounded-btn"
          >
            Feedback &amp; Suggestions
          </a>
        </footer>
        <Toaster
          position="bottom-center"
          reverseOrder
          toastOptions={{
            style: {
              backgroundColor: 'hsl(var(--n))',
              color: 'hsl(var(--nc))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--su))',
                secondary: 'hsl(var(--suc))',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--er))',
                secondary: 'hsl(var(--erc))',
              },
            },
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const App = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App

export const ErrorBoundary: ErrorBoundaryComponent = () => {
  const error = useRouteError()
  console.error(error)
  return (
    <Layout>
      <main className="space-y-8">
        <h1 className="text-5xl mt-8">something broke somewhere :(</h1>

        {error instanceof Error && (
          <pre className="overflow-x-auto">{error.stack || error.message}</pre>
        )}

        <Link to="." className="btn btn-ghost btn-block btn-outline">
          Try again ?
        </Link>
      </main>
    </Layout>
  )
}
