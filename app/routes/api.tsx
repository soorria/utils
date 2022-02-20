import { ActionFunction, json } from 'remix'
import { parse as parseContentType, ParsedMediaType } from 'content-type'
import { parseMultipartFormData } from '~/lib/uploads.server'
import { filterOnlyFiles } from '~/lib/utils'
import { getAllSizes, GetAllSizesInput } from '~/lib/sizes.server'

export const action: ActionFunction = async ({ request }) => {
  if (request.method.toLowerCase() !== 'post') {
    return json({}, 404)
  }

  let contentType: ParsedMediaType
  try {
    contentType = parseContentType(request.headers.get('Content-Type') ?? '')
  } catch (_) {
    return json({ message: 'Invalid Content-Type header' }, 400)
  }

  let input: GetAllSizesInput

  if (contentType.type === 'application/json') {
    const jsonBody = await request.json()

    if (typeof jsonBody.text !== 'string') {
      return json({
        message: 'text is required and must be a string',
      })
    }

    input = {
      text: jsonBody.text,
    }
  } else if (contentType.type === 'application/x-www-form-urlencoded') {
    const text = Object.fromEntries(await request.formData()).text

    if (typeof text !== 'string') {
      return json({
        message: 'text is required and must be a string',
      })
    }

    input = {
      text,
    }
  } else if (contentType.type === 'multipart/form-data') {
    const formData = await parseMultipartFormData(request)
    if (!formData) {
      return json(
        {
          message: 'Could not read request body. Maybe files are too large?',
        },
        400
      )
    }

    const formEntries = formData.getAll('files')
    const files = filterOnlyFiles(formEntries)

    if (formEntries.length !== files.length) {
      return json(
        {
          message: 'files must be files',
        },
        400
      )
    }

    const text = formData.get('text')
    input = {}

    if (typeof text !== 'string' && files.length === 0) {
      return json(
        {
          message: 'text or files must be provided',
        },
        400
      )
    }

    if (typeof text === 'string') {
      input.text = text
    }

    if (files.length) {
      input.files = Object.fromEntries(files.map(file => [file.name, file]))
    }
  } else {
    return json(
      {
        message: 'Invalid content type',
      },
      400
    )
  }

  const sizes = await getAllSizes(input)

  return json(sizes)
}

export const loader = () => json({}, 404)
