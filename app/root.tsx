import {
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'
import type { MetaFunction } from 'remix'
import appStyles from './app.css'
import { HeartIcon } from './components/icons'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: appStyles },
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
  ]
}

export const meta: MetaFunction = () => {
  return { title: 'Sizes | mooth.tech' }
}

type LoaderData = {
  js: boolean
  theme: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const data = {
    js: true,
    theme: 'dracula',
  } as LoaderData

  return data
}

const Layout: React.FC<LoaderData> = ({ children, js, theme }) => {
  return (
    <html lang="en" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          async
          defer
          data-domain="sizes.mooth.tech"
          data-api="https://mooth.tech/proxy/api/event"
          src="https://mooth.tech/js/potato.js"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="max-w-screen-lg w-full mx-auto py-8 px-4 space-y-8 flex flex-col h-full flex-1">
          <header className="">
            <h1 className="font-display text-5xl font-bold text-primary">
              Sizes
            </h1>
          </header>
          <div className="flex-1">{children}</div>
        </div>
        <footer className="py-8 text-center">
          <a
            href="https://mooth.tech/?ref=Sizes"
            target="_blank"
            rel="noopener noreferrer"
            className="group link link-hover"
          >
            Made with{' '}
            <span className="relative inline-block h-5 w-5 align-middle">
              <HeartIcon className="absolute inset-0 fill-current text-pink" />
              <HeartIcon className="absolute inset-0 fill-current text-purple group-hover:animate-ping" />
            </span>{' '}
            by <span className="underline">Soorria</span>
          </a>
        </footer>
        <ScrollRestoration />
        {js ? <Scripts /> : null}
        <LiveReload />
      </body>
    </html>
  )
}

const App: React.FC = () => {
  const data = useLoaderData<LoaderData>()

  return (
    <Layout {...data}>
      <Outlet />
    </Layout>
  )
}

export default App
