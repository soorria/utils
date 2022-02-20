import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from 'remix'

export const MAX_FILE_SIZE = 10_000_000

export const uploadHandler = unstable_createMemoryUploadHandler({
  maxFileSize: MAX_FILE_SIZE,
})

export const parseMultipartFormData = async (
  request: Request
): Promise<FormData | null> => {
  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    )
    return formData
  } catch (err) {
    return null
  }
}
