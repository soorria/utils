import { JSXElement } from 'solid-js'

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export enum ContentType {
  APPLICATION_JSON = 'application/json',
  MULTIPART_FORMDATA = 'multipart/form-data',
}

export enum ParamSource {
  PATH = 'path',
  QUERY = 'query',
  FORMDATA = 'formdata',
  JSON = 'json',
}

export type ApiRefSchema = {
  title?: JSXElement
  endpoints: ApiRefEndpoint[]
}

export type ApiRefEndpoint = {
  path: string
  method: HttpMethod
  request: {
    contentType: ContentType
    params: {
      name: string
      source: ParamSource
      description: JSXElement
    }[]
    note?: {
      title?: JSXElement
      body: JSXElement
    }
  }
  response: {
    contentType: ContentType
    statuses: {
      code: number
      description?: JSXElement

      example?: JSXElement
    }[]
  }
}
