import { ContentType, HttpMethod, ParamSource } from './types'

const _contentTypeToDisplayText: Record<ContentType, string> = {
  [ContentType.APPLICATION_JSON]: 'application/json',
  [ContentType.MULTIPART_FORMDATA]: 'multipart/form-data',
}
export const contentTypeToDisplay = (ct: ContentType) => {
  return _contentTypeToDisplayText[ct]
}

const _paramSourceToDisplayText: Record<ParamSource, string> = {
  [ParamSource.PATH]: 'url path',
  [ParamSource.QUERY]: 'url querystring',
  [ParamSource.FORMDATA]: 'formdata',
  [ParamSource.JSON]: 'json body',
}
export const paramSourceToDisplayText = (ps: ParamSource) => {
  return _paramSourceToDisplayText[ps]
}

const _httpMethodToColorClasses: Record<HttpMethod, string> = {
  get: 'bg-info text-info-content',
  post: 'bg-success text-success-content',
  put: 'bg-warning text-warning-content',
  patch: 'bg-warning text-warning-content',
  delete: 'bg-error text-error-content',
}
export const httpMethodToColorClasses = (method: HttpMethod) => {
  return _httpMethodToColorClasses[method]
}
