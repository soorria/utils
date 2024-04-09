import { Link } from '@remix-run/react'

const JobsIndexPlaceholder = () => {
  return (
    <>
      <div className="sticky top-4 hidden md:block">
        <h2 className="text-3xl text-primary mb-6">Job Details</h2>
        <div
          style={{ minHeight: '240px' }}
          className="grid place-items-center bg-base-300 rounded-btn p-8 text-center"
        >
          <div>
            Select or{' '}
            <Link
              to="new"
              className="link rounded-btn focus:ring-offset-base-300"
            >
              Create
            </Link>{' '}
            a job to see its details here
          </div>
        </div>
      </div>
    </>
  )
}

export default JobsIndexPlaceholder
