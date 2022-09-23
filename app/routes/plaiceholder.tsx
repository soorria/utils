import { FormEventHandler, useRef, useState } from 'react'
import {
  useActionData,
  useLoaderData,
  useTransition,
  json,
  useSubmit,
  ErrorBoundaryComponent,
  LoaderArgs,
  ActionArgs,
} from 'remix'
import FileInput, { FileSizeInfo } from '~/components/FileInput'
import BaseForm from '~/components/ui/BaseForm'
import ErrorSection from '~/components/ui/sections/ErrorSection'
import ResetButton from '~/components/ui/ResetButton'
import SubmitButton from '~/components/ui/SubmitButton'
import { getUtilBySlug } from '~/lib/all-utils.server'
import { MAX_FILE_SIZE, parseMultipartFormData } from '~/lib/uploads.server'
import { commonMetaFactory } from '~/lib/all-utils'
import Link from '~/components/BaseLink'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import {
  getPlaiceholdersForFiles,
  plaiceholderRequestBodySchema,
  PlaiceholderRequestErrors,
  PlaiceholderResult,
  PlaiceholderResultOptions,
} from '~/lib/plaiceholder'
import ResultsSection from '~/components/ui/sections/ResultsSection'
import toast from 'react-hot-toast'
import { cx, humanFileSize } from '~/lib/utils'
import { useCopy } from '~/lib/use-copy'
import Input from '~/components/ui/forms/Input'

export const meta = commonMetaFactory()
export const headers = passthroughCachingHeaderFactory()

type ActionData =
  | {
      status: 'success'
      placeholders: PlaiceholderResult
    }
  | ({ status: 'error' } & PlaiceholderRequestErrors)

export const action = async ({ request }: ActionArgs) => {
  const typedJson = json<ActionData>
  const formData = await parseMultipartFormData(request)

  if (!formData) {
    return typedJson(
      {
        status: 'error',
        formErrors: [
          "I couldn't read your submission. Maybe the files your uploaded are too large?",
        ],
        fieldErrors: {},
      },
      413
    )
  }

  const body = {
    images: formData.getAll('images'),
    size: formData.get('size'),
  }

  const parseResult = await plaiceholderRequestBodySchema.spa(body)

  if (!parseResult.success) {
    return typedJson(
      {
        status: 'error',
        ...parseResult.error.flatten(),
      },
      400
    )
  }

  try {
    const placeholders = await getPlaiceholdersForFiles(
      parseResult.data.images,
      parseResult.data.size
    )
    return typedJson({
      status: 'success',
      placeholders,
    })
  } catch (err) {
    return typedJson(
      {
        status: 'error',
        formErrors: ['Something went wrong generating placeholders :('],
        fieldErrors: {},
      },
      400
    )
  }
}

export const loader = async ({}: LoaderArgs) => {
  const utilData = getUtilBySlug('plaiceholder')

  return json(
    { maxSize: MAX_FILE_SIZE, utilData },
    { headers: { 'Cache-Control': 'public, s-maxage=31536000' } }
  )
}

const ids = {
  formError: 'form-error',
  fileInput: 'file',
  fileInputHelpText: 'file-help-text',
  sizeInput: 'size',
  sizeInputHelpText: 'size-help-text',
}

export default function Plaiceholder() {
  const { maxSize, utilData } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const transition = useTransition()
  const actionData = useActionData<typeof action>()
  const [files, setFiles] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [resetFileInputKey, setResetFileInputKey] = useState(0)

  const isSuccess = !transition.submission && actionData?.status === 'success'
  const isError = !transition.submission && actionData?.status === 'error'
  const isComplete = isSuccess || isError
  const isLoading = Boolean(transition.submission)

  // need this since we can't set the value of file inputs with js
  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const existingFiles = new Set(data.getAll('images'))

    files.forEach(file => {
      if (!existingFiles.has(file)) {
        data.append('images', file)
      }
    })

    submit(data, {
      method: 'post',
      encType: 'multipart/form-data',
      replace: true,
    })
  }

  const resetForm = () => {
    setResetFileInputKey(k => k + 1)
    formRef.current?.reset()
  }

  return (
    <UtilLayout util={utilData}>
      <BaseForm
        method="post"
        aria-errormessage={isError ? ids.formError : undefined}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        ref={formRef}
      >
        <FormControl>
          <FormLabel htmlFor={ids.fileInput}>your images</FormLabel>
          <FileInput
            key={resetFileInputKey}
            id={ids.fileInput}
            name="images"
            itemsName="images"
            aria-describedby={ids.fileInputHelpText}
            disabled={isLoading}
            onFiles={files => setFiles(files)}
            onError={() =>
              toast.error(
                <div className="space-y-2">
                  <p className="font-bold">Invalid files ignored</p>
                  <p className="text-sm">
                    Files must be less than {humanFileSize(maxSize)}, and can
                    only be images.
                  </p>
                </div>,
                {
                  duration: 5000,
                }
              )
            }
            multiple
            accept="image/*"
            maxSize={maxSize}
          />
          <FileSizeInfo id={ids.fileInputHelpText} maxSize={maxSize} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor={ids.sizeInput}>Placeholder Size</FormLabel>
          <Input
            type="number"
            id={ids.sizeInput}
            aria-describedby={ids.sizeInputHelpText}
            min={4}
            max={64}
            name="size"
            className="w-full"
            defaultValue={16}
          />
          <FormLabel variant="ALT" id={ids.sizeInputHelpText}>
            A higher size increases the quality of the placeholder, but also
            increases the size. Value must be within 4 and 64 inclusive.
          </FormLabel>
        </FormControl>

        <SubmitButton isLoading={isLoading}>Get Plaiceholders!</SubmitButton>
      </BaseForm>
      <ResetButton isLoading={isLoading} onClick={resetForm} />

      {isError ? (
        <ErrorSection utilSlug={utilData.slug} scrollOnMount>
          <div aria-live="assertive" className="space-y-6" id={ids.formError}>
            <ul className="list-disc pl-8 space-y-3">
              {actionData.formErrors?.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </div>
        </ErrorSection>
      ) : null}

      {isSuccess ? (
        // insert results using actionData.placeholders here
        <ResultsSection utilSlug={utilData.slug} scrollOnMount>
          <div className="space-y-16">
            {actionData.placeholders.map(({ fileName, placeholders }) => (
              <PlaiceholderResultCard
                key={fileName}
                placeholders={placeholders as PlaiceholderResultOptions}
                fileName={fileName}
              />
            ))}
          </div>
        </ResultsSection>
      ) : null}

      {isComplete && <ResetButton isLoading={isLoading} onClick={resetForm} />}
    </UtilLayout>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)

  return (
    <main className="space-y-8">
      <h1 className="text-5xl mt-8">something broke somewhere :(</h1>
      <p>
        Maybe you uploaded files that were too big or weren't images? Check the
        console for more details
      </p>

      <Link to="." className="btn btn-ghost btn-block btn-outline">
        Try again ?
      </Link>
    </main>
  )
}

const PlaiceholderOptionCopyButton: React.FC<{ text: string }> = ({
  text,
  children,
}) => {
  const [copy, copied] = useCopy()

  return (
    <button
      className="btn btn-primary btn-sm btn-block"
      onClick={() => copy(text)}
    >
      {copied ? 'Copied' : children}
    </button>
  )
}

const PlaiceholderResultCard: React.FC<{
  placeholders: PlaiceholderResultOptions
  fileName: string
}> = ({ placeholders, fileName }) => {
  const { base64, css, img } = placeholders

  return (
    <div key={fileName}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col justify-between">
          <div className="text-xl font-bold sticky top-4 bg-base-100 pb-4">
            Placeholders for <code>{fileName}</code>
          </div>

          <p>
            More formats from <code>plaiceholder</code> coming soon...
          </p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-box">
              <img
                className={cx(
                  'absolute',
                  'inset-0',
                  'w-full',
                  'h-full',
                  'transform',
                  'scale-150',
                  'filter',
                  'blur-2xl',
                  'z-[-1]'
                )}
                src={base64}
              />
              <img
                width={img.width}
                height={img.height}
                src=""
                className="w-full opacity-0"
              />
            </div>
            <div className="space-y-2">
              <p className="font-semibold">
                Base64 Data URI (for Next.js' <code>blurDataURL</code>)
              </p>
              <PlaiceholderOptionCopyButton text={base64}>
                Copy Data URI
              </PlaiceholderOptionCopyButton>
            </div>
          </div>
          {/* <div>
            <div className="relative overflow-hidden">
              <div
                className={cx(
                  'absolute',
                  'inset-0',
                  'w-full',
                  'h-full',
                  'transform',
                  'scale-150',
                  'filter',
                  'blur-2xl',
                  'z-[-1]'
                )}
                style={placeholders.css}
              />
              <img
                width={placeholders.img.width}
                height={placeholders.img.height}
                src=""
                className="w-full opacity-0"
              />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

// const MOCK_RESULT = [
//   [
//     '0b8oci32ubc81.jpg',
//     {
//       img: {
//         src: null,
//         width: 3840,
//         height: 2160,
//         type: 'jpg',
//       },
//       css: {
//         backgroundImage:
//           'linear-gradient(90deg, rgb(98,23,33) 25%,rgb(139,74,80) 25% 50%,rgb(85,30,34) 50% 75%,rgb(85,8,11) 75% 100%),linear-gradient(90deg, rgb(29,0,29) 25%,rgb(34,14,57) 25% 50%,rgb(114,72,18) 50% 75%,rgb(50,8,21) 75% 100%)',
//         backgroundPosition: '0 0 ,0 100%',
//         backgroundSize: '100% 50%',
//         backgroundRepeat: 'no-repeat',
//       },
//       base64:
//         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAIAAADwyuo0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAI0lEQVR4nGPYEJvw//mbWdExXdamDBIMEobSHv9P9TuIKgIAmKYKHTaBiwgAAAAASUVORK5CYII=',
//       blurhash: {
//         width: 4,
//         height: 2,
//         hash: 'UMAIDZ-CNKnh}Z-Bn*jF=L-A$zWB}Z-Bn*jF',
//       },
//       svg: [
//         'svg',
//         {
//           xmlns: 'http://www.w3.org/2000/svg',
//           width: '100%',
//           height: '100%',
//           shapeRendering: 'crispEdges',
//           preserveAspectRatio: 'none',
//           viewBox: '0 0 4 2',
//           style: {
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transformOrigin: 'top left',
//             transform: 'translate(-50%, -50%)',
//             right: 0,
//             bottom: 0,
//           },
//         },
//         [
//           [
//             'rect',
//             {
//               fill: 'rgb(98,23,33)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 0,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(139,74,80)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 1,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(85,30,34)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 2,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(85,8,11)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 3,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(29,0,29)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 0,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(34,14,57)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 1,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(114,72,18)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 2,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(50,8,21)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 3,
//               y: 1,
//             },
//           ],
//         ],
//       ],
//     },
//   ],
//   ,
//   [
//     '0b8oci32ubc81.jpg',
//     {
//       img: {
//         src: null,
//         width: 3840,
//         height: 2160,
//         type: 'jpg',
//       },
//       css: {
//         backgroundImage:
//           'linear-gradient(90deg, rgb(98,23,33) 25%,rgb(139,74,80) 25% 50%,rgb(85,30,34) 50% 75%,rgb(85,8,11) 75% 100%),linear-gradient(90deg, rgb(29,0,29) 25%,rgb(34,14,57) 25% 50%,rgb(114,72,18) 50% 75%,rgb(50,8,21) 75% 100%)',
//         backgroundPosition: '0 0 ,0 100%',
//         backgroundSize: '100% 50%',
//         backgroundRepeat: 'no-repeat',
//       },
//       base64:
//         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAIAAADwyuo0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAI0lEQVR4nGPYEJvw//mbWdExXdamDBIMEobSHv9P9TuIKgIAmKYKHTaBiwgAAAAASUVORK5CYII=',
//       blurhash: {
//         width: 4,
//         height: 2,
//         hash: 'UMAIDZ-CNKnh}Z-Bn*jF=L-A$zWB}Z-Bn*jF',
//       },
//       svg: [
//         'svg',
//         {
//           xmlns: 'http://www.w3.org/2000/svg',
//           width: '100%',
//           height: '100%',
//           shapeRendering: 'crispEdges',
//           preserveAspectRatio: 'none',
//           viewBox: '0 0 4 2',
//           style: {
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transformOrigin: 'top left',
//             transform: 'translate(-50%, -50%)',
//             right: 0,
//             bottom: 0,
//           },
//         },
//         [
//           [
//             'rect',
//             {
//               fill: 'rgb(98,23,33)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 0,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(139,74,80)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 1,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(85,30,34)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 2,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(85,8,11)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 3,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(29,0,29)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 0,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(34,14,57)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 1,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(114,72,18)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 2,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(50,8,21)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 3,
//               y: 1,
//             },
//           ],
//         ],
//       ],
//     },
//   ],
//   ,
//   [
//     '0b8oci32ubc81.jpg',
//     {
//       img: {
//         src: null,
//         width: 3840,
//         height: 2160,
//         type: 'jpg',
//       },
//       css: {
//         backgroundImage:
//           'linear-gradient(90deg, rgb(98,23,33) 25%,rgb(139,74,80) 25% 50%,rgb(85,30,34) 50% 75%,rgb(85,8,11) 75% 100%),linear-gradient(90deg, rgb(29,0,29) 25%,rgb(34,14,57) 25% 50%,rgb(114,72,18) 50% 75%,rgb(50,8,21) 75% 100%)',
//         backgroundPosition: '0 0 ,0 100%',
//         backgroundSize: '100% 50%',
//         backgroundRepeat: 'no-repeat',
//       },
//       base64:
//         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAIAAADwyuo0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAI0lEQVR4nGPYEJvw//mbWdExXdamDBIMEobSHv9P9TuIKgIAmKYKHTaBiwgAAAAASUVORK5CYII=',
//       blurhash: {
//         width: 4,
//         height: 2,
//         hash: 'UMAIDZ-CNKnh}Z-Bn*jF=L-A$zWB}Z-Bn*jF',
//       },
//       svg: [
//         'svg',
//         {
//           xmlns: 'http://www.w3.org/2000/svg',
//           width: '100%',
//           height: '100%',
//           shapeRendering: 'crispEdges',
//           preserveAspectRatio: 'none',
//           viewBox: '0 0 4 2',
//           style: {
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transformOrigin: 'top left',
//             transform: 'translate(-50%, -50%)',
//             right: 0,
//             bottom: 0,
//           },
//         },
//         [
//           [
//             'rect',
//             {
//               fill: 'rgb(98,23,33)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 0,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(139,74,80)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 1,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(85,30,34)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 2,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(85,8,11)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 3,
//               y: 0,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(29,0,29)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 0,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(34,14,57)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 1,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(114,72,18)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 2,
//               y: 1,
//             },
//           ],
//           [
//             'rect',
//             {
//               fill: 'rgb(50,8,21)',
//               fillOpacity: 1,
//               width: 1,
//               height: 1,
//               x: 3,
//               y: 1,
//             },
//           ],
//         ],
//       ],
//     },
//   ],
// ] as unknown as PlaiceholderResult
