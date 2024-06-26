import { ActionFunction, json } from '@remix-run/node'
import { parse as parseContentType, ParsedMediaType } from 'content-type'
import { parseMultipartFormData } from '~/lib/uploads.server'
import { getAllSizes, sizesRequestBodySchema } from '~/lib/sizes.server'

export const action: ActionFunction = async ({ request }) => {
  if (request.method.toLowerCase() !== 'post') {
    return json(
      {},
      {
        status: 405,
        headers: {
          Allow: 'POST',
        },
      }
    )
  }

  let contentType: ParsedMediaType
  try {
    contentType = parseContentType(request.headers.get('Content-Type') ?? '')
  } catch {
    return json({ formErrors: ['Invalid Content-Type header'] }, 400)
  }

  let payload: unknown

  if (contentType.type === 'application/json') {
    payload = await request.json()
  } else if (contentType.type === 'multipart/form-data') {
    const formData = await parseMultipartFormData(request)
    if (!formData) {
      return json(
        {
          formErrors: [
            'Could not read request body. Maybe files are too large?',
          ],
        },
        400
      )
    }

    payload = (() => {
      const files = formData.getAll('files')
      formData.delete('files')
      const _payload: any = Object.fromEntries(formData)
      _payload.files = files
      return _payload
    })()
  } else {
    return json(
      {
        formErrors: ['Invalid content type'],
      },
      400
    )
  }

  if (payload && typeof payload === 'object') (payload as any)._isFromApi = true

  const parseResult = await sizesRequestBodySchema.spa(payload)

  console.log(parseResult, payload)

  if (!parseResult.success) {
    return json(parseResult.error.flatten(), 400)
  }

  const { text, files, ...options } = parseResult.data

  const sizes = await getAllSizes({ text, files }, options)

  return json(sizes)
}

export const loader = () => json({}, 404)
