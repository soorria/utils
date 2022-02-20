import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from 'remix'

export const uploadHandler = unstable_createMemoryUploadHandler({
  maxFileSize: 5_000_000,
})

export const parseMultipartFormData = async (
  request: Request
): Promise<FormData | null> => {
  return unstable_parseMultipartFormData(request, uploadHandler).catch(
    () => null
  )
}
