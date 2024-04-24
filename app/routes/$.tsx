import { json } from '@remix-run/node'
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import Link from '~/components/BaseLink'

export const loader = () => {
  throw json({}, 404)
}

export const ErrorBoundary = () => {
  const error = useRouteError()
  let message = error instanceof Error ? error.message : 'An error occurred'
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "You're lost" : 'An error occurred'
  }
  return (
    <main className="text-center space-y-8">
      <h1 className="text-5xl mt-16 text-primary">{message}</h1>
      <div className="flex space-x-4 justify-center">
        <Link to="/" className="link link-hover link-primary">
          back home
        </Link>
      </div>
    </main>
  )
}

export default () => null
