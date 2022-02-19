import { json, Link, useCatch } from 'remix'

export const loader = () => {
  throw json({}, 404)
}

export const CatchBoundary: React.FC = () => {
  const caught = useCatch()
  const text = caught.status === 404 ? "You're Lost!" : 'something went wrong'
  return (
    <main className="text-center space-y-8">
      <h1 className="text-5xl mt-16 text-primary">{text}</h1>
      <div className="flex space-x-4 justify-center">
        <Link to="/" className="link link-hover link-primary">
          back home
        </Link>
      </div>
    </main>
  )
}

export default () => null
