import {
  ActionFunction,
  Form,
  useActionData,
  Link,
  LoaderFunction,
  useLoaderData,
  useTransition,
} from 'remix'
import { getSizes, Sizes } from '~/lib/sizes.server'
import { capitalise, randomItem } from '~/lib/utils'

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

type LoaderData = { title: string }

export const loader: LoaderFunction = () => {
  const titles = [
    'character counter',
    'measuring machine',
    'byte counter',
    'measuring tape',
  ]
  return { title: randomItem(titles) }
}

const formatOrder = ['initial', 'gzip', 'brotli'] as const

const ids = {
  formError: 'form-error',
  textarea: 'text',
}

export default function Index() {
  const { title } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const transition = useTransition()

  const isSuccess = actionData?.status === 'success'
  const isError = actionData?.status === 'error'
  const isLoading = Boolean(transition.submission)

  return (
    <main className="space-y-8">
      <h1 className="text-5xl mt-8">{title}</h1>

      {isError ? (
        <div className="space-y-6 p-4 border-red border-2 rounded-btn">
          <h2 className="text-3xl text-red">something went wrong :(</h2>
          <p aria-live="assertive" id={ids.formError}>
            {actionData.error}
          </p>
        </div>
      ) : null}

      {isSuccess ? (
        <div className="space-y-6 p-4 border-green border-2 rounded-btn">
          <h2 className="text-3xl text-green">your results</h2>
          <table className="table w-full">
            <thead>
              <tr>
                <th>format</th>
                <th>size (bytes)</th>
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
        <div className="space-y-4 form-control">
          <label className="label text-xl" htmlFor={ids.textarea}>
            your text
          </label>
          <textarea
            id={ids.textarea}
            name="text"
            className="form-control textarea textarea-primary w-full min-h-[16rem]"
            placeholder="your text here"
            defaultValue={
              actionData?.status === 'success' ? actionData.text : ''
            }
            required
          />
        </div>
        <button
          type="submit"
          className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
        >
          see sizes!
        </button>
      </Form>
      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Reset
      </Link>
    </main>
  )
}
