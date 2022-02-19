import { ActionFunction, Form, useActionData, Link } from 'remix'
import { getSizes, Sizes } from '~/lib/sizes.server'
import { capitalise } from '~/lib/utils'

type ActionData =
  | {
      status: 'success'
      text: string
      sizes: Sizes
    }
  | {
      status: 'error'
      error: string
    }

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const formData = await request.formData()
  const text = formData.get('text')

  if (typeof text !== 'string') {
    return { status: 'error', error: 'Text is required and must be a string' }
  }

  const sizes = await getSizes(text)

  return { status: 'success', text, sizes }
}

const formatOrder = ['initial', 'gzip', 'brotli'] as const

const ids = {
  formError: 'form-error',
}

export default function Index() {
  const actionData = useActionData<ActionData>()

  const isSuccess = actionData?.status === 'success'
  const isError = actionData?.status === 'error'

  return (
    <main className="space-y-8">
      {isError ? (
        <div className="space-y-6 p-4 border-red border-2 rounded-btn">
          <h2 className="text-3xl text-red font-bold font-display">
            Something went wrong :(
          </h2>
          <p aria-live="assertive" id={ids.formError}>
            {actionData.error}
          </p>
        </div>
      ) : null}

      {isSuccess ? (
        <div className="space-y-6 p-4 border-green border-2 rounded-btn">
          <h2 className="text-3xl text-green font-bold font-display">
            Your Results
          </h2>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Format</th>
                <th>Size (bytes)</th>
              </tr>
            </thead>
            <tbody>
              {formatOrder.map(format => (
                <tr key={format} className="hover">
                  <td>{capitalise(format)}</td>
                  <td>{actionData.sizes[format]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Form
        method="post"
        className="space-y-8"
        aria-errormessage={isError ? ids.formError : undefined}
      >
        <div className="space-y-4">
          <label className="label text-xl" htmlFor="text">
            Your Text
          </label>
          <textarea
            id="text"
            name="text"
            className="form-control textarea textarea-primary w-full min-h-[16rem]"
            placeholder="your text here"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          See sizes!
        </button>
      </Form>
      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Reset
      </Link>
    </main>
  )
}
